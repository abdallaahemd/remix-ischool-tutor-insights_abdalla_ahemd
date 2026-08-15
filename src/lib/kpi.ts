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

export const MAX_TOTAL = KPI_DEFINITIONS.reduce((sum, k) => sum + k.max, 0);

export function totalScore(tutor: Tutor) {
  return KPI_DEFINITIONS.reduce((sum, k) => sum + (tutor[k.key] ?? 0), 0);
}

export function totalPercentage(tutor: Tutor) {
  return (totalScore(tutor) / MAX_TOTAL) * 100;
}

export function ratingLabel(percentage: number) {
  if (percentage >= 95) return "Outstanding";
  if (percentage >= 85) return "Exceeds Expectations";
  if (percentage >= 70) return "Meets Expectations";
  if (percentage >= 55) return "Needs Improvement";
  return "Below Expectations";
}
