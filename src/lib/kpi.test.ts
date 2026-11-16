import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasValidKpiScores,
  isValidQualityScore,
  scoreBreakdown,
  type Tutor,
  withQualityScore,
} from "@/lib/kpi";

const tutorWith = (kpiTotal: number, quality: number | null): Tutor => ({
  id: "test-tutor",
  name: "Test Tutor",
  innovation: Math.min(kpiTotal, 10),
  adaptability: Math.min(Math.max(kpiTotal - 10, 0), 5),
  growth: Math.min(Math.max(kpiTotal - 15, 0), 10),
  professionalism: Math.min(Math.max(kpiTotal - 25, 0), 5),
  attendance: Math.min(Math.max(kpiTotal - 30, 0), 10),
  recordedTotal: quality,
});

describe("weighted tutor score", () => {
  it("scores max KPIs and Quality 100 as 100/100", () => {
    const result = scoreBreakdown(tutorWith(40, 100));
    assert.equal(result.kpiScore, 40);
    assert.equal(result.qualityScore, 60);
    assert.equal(result.total, 100);
  });

  it("scores max KPIs and Quality 80 as 88/100", () => {
    const result = scoreBreakdown(tutorWith(40, 80));
    assert.equal(result.qualityScore, 48);
    assert.equal(result.total, 88);
  });

  it("scores KPIs 30 and Quality 75 as 75/100", () => {
    assert.equal(scoreBreakdown(tutorWith(30, 75)).total, 75);
  });

  it("scores KPIs 35 and Quality 0 as 35/100", () => {
    assert.equal(scoreBreakdown(tutorWith(35, 0)).total, 35);
  });

  it("rejects Growth Mindset above its maximum of 10", () => {
    assert.equal(hasValidKpiScores({ ...tutorWith(40, 80), growth: 11 }), false);
  });

  it("returns no total when Quality is missing", () => {
    const result = scoreBreakdown(tutorWith(30, null));
    assert.equal(result.qualityScore, null);
    assert.equal(result.total, null);
    assert.equal(result.percentage, null);
  });

  it("accepts Quality scores from 0 through 100 and rejects values outside that range", () => {
    assert.equal(isValidQualityScore(0), true);
    assert.equal(isValidQualityScore(100), true);
    assert.equal(isValidQualityScore(-1), false);
    assert.equal(isValidQualityScore(101), false);
  });

  it("uses the Quality value for the selected month", () => {
    const tutor = { ...tutorWith(30, null), qualityByMonth: { January: 75, February: 80 } };
    assert.equal(scoreBreakdown(tutor, "January").total, 75);
    assert.equal(scoreBreakdown(tutor, "March").total, null);
  });

  it("updates an edited monthly Quality score in the weighted total", () => {
    const tutor = { ...tutorWith(30, null), qualityByMonth: { January: 75, February: 80 } };
    const edited = withQualityScore(tutor, "January", 90);
    assert.equal(scoreBreakdown(edited, "January").total, 84);
    assert.equal(scoreBreakdown(edited, "February").total, 78);
  });

  it("updates a non-monthly Quality score without changing KPI values", () => {
    const tutor = tutorWith(30, 75);
    const edited = withQualityScore(tutor, "January", 90);
    assert.equal(edited.recordedTotal, 90);
    assert.equal(edited.innovation, tutor.innovation);
    assert.equal(scoreBreakdown(edited, "January").total, 84);
  });
});