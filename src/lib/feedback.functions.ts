import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const Input = z.object({
  feedbackType: z.string().min(1),
  rawFeedback: z.string().min(1),
  tutorName: z.string().optional(),
  month: z.string().optional(),
});

export const generateFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const system = [
      "You are an HR evaluation writer for iSchool, producing monthly tutor evaluation feedback.",
      "Rewrite the mentor's raw notes into professional, polished evaluation feedback.",
      "Rules:",
      "- Never copy the input verbatim; always rewrite in professional language.",
      "- Never invent facts, numbers, incidents or achievements that are not in the notes.",
      "- Ground everything strictly in the provided notes and the selected feedback type.",
      "- Where the notes support it, include recognition of strengths, areas needing improvement, and a concrete recommendation.",
      "- Write 2-4 short paragraphs or a concise paragraph plus bullet points; no headings, no salutation, no signature.",
      "- Neutral, respectful, corporate tone in English. Output plain text only.",
    ].join("\n");

    const prompt = [
      `Feedback type: ${data.feedbackType}`,
      data.tutorName ? `Tutor: ${data.tutorName}` : "",
      data.month ? `Evaluation month: ${data.month}` : "",
      "",
      "Mentor's raw notes:",
      data.rawFeedback,
    ]
      .filter(Boolean)
      .join("\n");

    const result = streamText({
      model: gateway("google/gemini-3-flash"),
      system,
      prompt,
    });

    return { text: (await result.text).trim() };
  });
