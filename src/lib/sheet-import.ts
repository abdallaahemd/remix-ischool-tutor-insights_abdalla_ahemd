import type { Tutor } from "@/lib/kpi";

export type FieldKey =
  | "id"
  | "name"
  | "innovation"
  | "adaptability"
  | "growth"
  | "professionalism"
  | "attendance"
  | "recordedTotal";

export const FIELD_LABELS: Record<FieldKey, string> = {
  id: "Tutor ID",
  name: "Tutor Name",
  innovation: "Innovation / Team Collaboration",
  adaptability: "Adaptability",
  growth: "Growth Mindset",
  professionalism: "Professionalism",
  attendance: "Dependability / Attendance",
  recordedTotal: "Total Score (sheet)",
};

export const REQUIRED_FIELDS: FieldKey[] = ["id", "name"];

const ALIASES: Record<FieldKey, string[]> = {
  id: ["tutorid", "id", "code", "tutorcode", "employeeid"],
  name: ["tutorname", "name", "tutor", "fullname", "instructorname"],
  innovation: ["innovation", "teamcollaboration", "collaboration"],
  adaptability: ["adaptability", "adaptabilitytochange", "adapt"],
  growth: ["growthmindset", "growth", "mindset"],
  professionalism: ["professionalism", "professional", "attitude"],
  attendance: ["dependabilityattendance", "attendance", "dependability", "punctuality"],
  recordedTotal: ["totalscore", "total", "score", "overall", "finalscore"],
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export type SheetAnalysis = {
  headers: string[];
  mapping: Partial<Record<FieldKey, string>>;
  rows: Record<string, unknown>[];
};

export async function analyzeSheet(file: File): Promise<SheetAnalysis> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const sheet = sheetName ? wb.Sheets[sheetName] : undefined;
  const rows = sheet
    ? XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null })
    : [];
  const headers = rows[0] ? Object.keys(rows[0]) : [];

  const mapping: Partial<Record<FieldKey, string>> = {};
  const used = new Set<string>();
  (Object.keys(ALIASES) as FieldKey[]).forEach((field) => {
    const match =
      headers.find((h) => !used.has(h) && ALIASES[field].includes(norm(h))) ??
      headers.find(
        (h) =>
          !used.has(h) &&
          norm(h) !== "quality" &&
          ALIASES[field].some((a) => a.length > 4 && norm(h).includes(a)),
      );
    if (match) {
      mapping[field] = match;
      used.add(match);
    }
  });
  return { headers, mapping, rows };
}

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

export type SyncSummary = {
  detected: number;
  added: number;
  updated: number;
  unchanged: number;
  errors: number;
};

export function buildTutorsFromSheet(
  analysis: SheetAnalysis,
  mapping: Partial<Record<FieldKey, string>>,
): { tutors: Tutor[]; errors: number } {
  const tutors: Tutor[] = [];
  let errors = 0;
  const seen = new Set<string>();

  for (const row of analysis.rows) {
    const id = mapping.id ? String(row[mapping.id] ?? "").trim() : "";
    const name = mapping.name ? String(row[mapping.name] ?? "").trim() : "";
    if (!id || !name || seen.has(id)) {
      if (Object.values(row).some((v) => v !== null && v !== "")) errors += 1;
      continue;
    }
    seen.add(id);
    tutors.push({
      id,
      name,
      innovation: mapping.innovation ? num(row[mapping.innovation]) : null,
      adaptability: mapping.adaptability ? num(row[mapping.adaptability]) : null,
      growth: mapping.growth ? num(row[mapping.growth]) : null,
      professionalism: mapping.professionalism ? num(row[mapping.professionalism]) : null,
      attendance: mapping.attendance ? num(row[mapping.attendance]) : null,
      recordedTotal: mapping.recordedTotal ? num(row[mapping.recordedTotal]) : null,
    });
  }
  return { tutors, errors };
}

export function mergeTutors(current: Tutor[], incoming: Tutor[]) {
  const byId = new Map(current.map((t) => [t.id, t]));
  let added = 0;
  let updated = 0;
  let unchanged = 0;

  for (const tutor of incoming) {
    const existing = byId.get(tutor.id);
    if (!existing) {
      byId.set(tutor.id, tutor);
      added += 1;
    } else if (JSON.stringify(existing) !== JSON.stringify(tutor)) {
      byId.set(tutor.id, tutor);
      updated += 1;
    } else {
      unchanged += 1;
    }
  }

  return { merged: Array.from(byId.values()), added, updated, unchanged };
}
