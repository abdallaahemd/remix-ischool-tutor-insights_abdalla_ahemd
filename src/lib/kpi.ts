import tutorsData from "@/data/tutors.json";

export type Tutor = {
  id: string;
  name: string;
  innovation: number | null;
  adaptability: number | null;
  growth: number | null;
  professionalism: number | null;
  attendance: number | null;
  recordedTotal: number | null;
  qualityByMonth?: Record<string, number | null>;
};

export const tutors = tutorsData as Tutor[];

export type KpiKey = keyof Pick<
  Tutor,
  "innovation" | "adaptability" | "growth" | "professionalism" | "attendance"
>;

export const KPI_DEFINITIONS: { key: KpiKey; label: string; description: string; max: number }[] = [
  {
    key: "innovation",
    label: "Innovation & Team Collaboration",
    description: "Idea contribution, communication and teamwork",
    max: 10,
  },
  {
    key: "adaptability",
    label: "Adaptability to Change",
    description: "Response to new policies and processes",
    max: 5,
  },
  {
    key: "growth",
    label: "Growth Mindset",
    description: "Openness to feedback and continuous learning",
    max: 10,
  },
  {
    key: "professionalism",
    label: "Professionalism",
    description: "Attitude and workplace respect",
    max: 5,
  },
  {
    key: "attendance",
    label: "Dependability & Attendance",
    description: "Punctuality, commitment and reliability",
    max: 10,
  },
];

export const KPI_WEIGHT = 40;
export const QUALITY_WEIGHT = 60;
export const QUALITY_MAX = 100;
export const FINAL_SCORE_MAX = KPI_WEIGHT + QUALITY_WEIGHT;
export const MAX_TOTAL = KPI_WEIGHT;

export function getQualityValue(tutor: Tutor, month?: string) {
  const monthlyValues = tutor.qualityByMonth;
  if (monthlyValues && Object.keys(monthlyValues).length > 0) {
    return month ? (monthlyValues[month] ?? null) : null;
  }
  return tutor.recordedTotal;
}

export function withQualityScore(tutor: Tutor, month: string, quality: number | null): Tutor {
  if (Object.keys(tutor.qualityByMonth ?? {}).length > 0) {
    return {
      ...tutor,
      qualityByMonth: { ...(tutor.qualityByMonth ?? {}), [month]: quality },
    };
  }
  return { ...tutor, recordedTotal: quality };
}

export function isValidScore(value: number | null | undefined, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max;
}

export function isValidQualityScore(value: number | null | undefined) {
  return isValidScore(value, QUALITY_MAX);
}

export function formatScore(value: number) {
  const rounded = roundToTwo(value);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

function roundToTwo(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function kpiScore(tutor: Tutor) {
  return roundToTwo(KPI_DEFINITIONS.reduce((sum, k) => sum + (tutor[k.key] ?? 0), 0));
}

export function hasValidKpiScores(tutor: Tutor) {
  return KPI_DEFINITIONS.every((kpi) => isValidScore(tutor[kpi.key] ?? 0, kpi.max));
}

export function qualityPoints(quality: number | null | undefined) {
  if (quality === null || quality === undefined || !isValidQualityScore(quality)) return null;
  return roundToTwo((quality / QUALITY_MAX) * QUALITY_WEIGHT);
}

export function scoreBreakdown(tutor: Tutor, month?: string) {
  const quality = getQualityValue(tutor, month);
  const qualityScore = qualityPoints(quality);
  const total = qualityScore === null ? null : roundToTwo(kpiScore(tutor) + qualityScore);
  return {
    kpiScore: kpiScore(tutor),
    quality,
    qualityScore,
    total,
    percentage: total === null ? null : roundToTwo((total / FINAL_SCORE_MAX) * 100),
  };
}

export function totalScore(tutor: Tutor, month?: string) {
  return scoreBreakdown(tutor, month).total;
}

export function totalPercentage(tutor: Tutor, month?: string) {
  const total = totalScore(tutor, month);
  return total === null ? null : roundToTwo((total / FINAL_SCORE_MAX) * 100);
}

export function ratingLabel(percentage: number) {
  if (percentage >= 95) return "Outstanding";
  if (percentage >= 85) return "Exceeds Expectations";
  if (percentage >= 70) return "Meets Expectations";
  if (percentage >= 55) return "Needs Improvement";
  return "Below Expectations";
}
