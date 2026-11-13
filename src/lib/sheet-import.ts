import {
  isValidScore,
  KPI_DEFINITIONS,
  QUALITY_MAX,
  type KpiKey,
  type Tutor,
} from "@/lib/kpi";

export type FieldKey =
  | "id"
  | "name"
  | "innovation"
  | "adaptability"
  | "growth"
  | "professionalism"
  | "attendance"
  | "recordedTotal"
  | "evaluationMonth";

export const FIELD_LABELS: Record<FieldKey, string> = {
  id: "Tutor ID",
  name: "Tutor Name",
  innovation: "Innovation / Team Collaboration",
  adaptability: "Adaptability",
  growth: "Growth Mindset",
  professionalism: "Professionalism",
  attendance: "Dependability / Attendance",
  recordedTotal: "Quality Score (sheet, max 100)",
  evaluationMonth: "Evaluation Month (sheet)",
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
  recordedTotal: ["qualityscore", "quality", "totalscore", "total", "score", "overall", "finalscore"],
  evaluationMonth: ["evaluationmonth", "month", "evaluationperiod", "period"],
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
  const cleaned = String(v).replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const hasSheetValue = (value: unknown) =>
  value !== null && value !== undefined && String(value).trim() !== "";

function importedKpiValue(
  row: Record<string, unknown>,
  mapping: Partial<Record<FieldKey, string>>,
  key: KpiKey,
) {
  const column = mapping[key];
  if (!column) return null;
  const value = num(row[column]);
  const definition = KPI_DEFINITIONS.find((kpi) => kpi.key === key);
  return value !== null && definition && isValidScore(value, definition.max) ? value : null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function normalizeEvaluationMonth(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86_400_000);
    return MONTHS[date.getUTCMonth()] ?? null;
  }
  const text = String(value ?? "").trim();
  if (!text) return null;
  const namedMonth = MONTHS.find((month) =>
    new RegExp(`\\b${month.slice(0, 3)}(?:${month.slice(3)})?\\b`, "i").test(text),
  );
  if (namedMonth) return namedMonth;
  const yearFirst = text.match(/^\d{4}[-/]([0-1]?\d)(?:[-/]\d{1,2})?$/);
  const monthFirst = text.match(/^([0-1]?\d)[-/]\d{4}$/);
  const numericMonth = Number(yearFirst?.[1] ?? monthFirst?.[1]);
  return numericMonth >= 1 && numericMonth <= 12 ? MONTHS[numericMonth - 1] ?? null : null;
}

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
  const tutorsById = new Map<string, Tutor>();
  let errors = 0;
  const seen = new Set<string>();
  const monthlyQuality = Boolean(mapping.evaluationMonth && mapping.recordedTotal);

  for (const row of analysis.rows) {
    const id = mapping.id ? String(row[mapping.id] ?? "").trim() : "";
    const name = mapping.name ? String(row[mapping.name] ?? "").trim() : "";
    const month = monthlyQuality
      ? normalizeEvaluationMonth(row[mapping.evaluationMonth ?? ""])
      : null;
    const rowKey = monthlyQuality ? `${id}\u0000${month ?? "__invalid_month__"}` : id;
    if (!id || !name || seen.has(rowKey) || (monthlyQuality && !month)) {
      if (Object.values(row).some((v) => v !== null && v !== "")) errors += 1;
      continue;
    }
    seen.add(rowKey);
    const existing = tutorsById.get(id) as Tutor | undefined;
    const rawQuality = mapping.recordedTotal ? row[mapping.recordedTotal] : null;
    const quality = num(rawQuality);
    const validQuality = quality === null || isValidScore(quality, QUALITY_MAX);
    if (mapping.recordedTotal && hasSheetValue(rawQuality) && quality === null) errors += 1;
    if (!validQuality) errors += 1;
    const tutor: Tutor = existing ?? {
      id,
      name,
      innovation: importedKpiValue(row, mapping, "innovation"),
      adaptability: importedKpiValue(row, mapping, "adaptability"),
      growth: importedKpiValue(row, mapping, "growth"),
      professionalism: importedKpiValue(row, mapping, "professionalism"),
      attendance: importedKpiValue(row, mapping, "attendance"),
      recordedTotal: monthlyQuality ? null : validQuality ? quality : null,
    };
    if (existing?.qualityByMonth) tutor.qualityByMonth = existing.qualityByMonth;
    if (monthlyQuality && month) {
      tutor.qualityByMonth = {
        ...(tutor.qualityByMonth ?? {}),
        [month]: validQuality ? quality : null,
      };
    } else if (mapping.recordedTotal) {
      tutor.recordedTotal = validQuality ? quality : null;
    }
    for (const kpi of KPI_DEFINITIONS) {
      const column = mapping[kpi.key];
      const imported = importedKpiValue(row, mapping, kpi.key);
      if (column && imported === null && hasSheetValue(row[column])) errors += 1;
    }
    tutorsById.set(id, tutor);
  }
  return { tutors: Array.from(tutorsById.values()), errors };
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
      const qualityByMonth = { ...existing.qualityByMonth, ...tutor.qualityByMonth };
      const mergedTutor: Tutor = {
        ...existing,
        ...tutor,
        ...(Object.keys(qualityByMonth).length > 0 ? { qualityByMonth } : {}),
      };
      byId.set(tutor.id, mergedTutor);
      updated += 1;
    } else {
      unchanged += 1;
    }
  }

  return { merged: Array.from(byId.values()), added, updated, unchanged };
}
