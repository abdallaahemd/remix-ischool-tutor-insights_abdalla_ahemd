import logoAsset from "@/assets/ischool-logo.png.asset.json";
import {
  FINAL_SCORE_MAX,
  KPI_DEFINITIONS,
  KPI_WEIGHT,
  MAX_TOTAL,
  QUALITY_MAX,
  QUALITY_WEIGHT,
  formatScore,
  ratingLabel,
  scoreBreakdown,
  type Tutor,
} from "@/lib/kpi";

export type ReportMeta = {
  mentor: string;
  teamLeader: string;
  month: string;
  feedback: string;
};

export function ReportSheet({ tutor, meta }: { tutor: Tutor; meta: ReportMeta }) {
  const breakdown = scoreBreakdown(tutor, meta.month);
  const score = breakdown.total ?? 0;
  const percentage = breakdown.percentage ?? 0;

  return (
    <div
      id="report-sheet"
      className="mx-auto w-full max-w-[820px] overflow-hidden rounded-2xl bg-card shadow-report"
    >
      <header className="report-header px-8 py-5 sm:px-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="iSchool" className="h-10 w-auto" />
            <span className="hidden h-9 w-px bg-accent sm:block" />
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-sky">
                iSchool
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                Official Evaluation Document
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tracking-tight text-primary">
              Monthly Tutor Evaluation Report
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              KPI &amp; Culture Fit Assessment
            </p>
            <span className="mt-1.5 inline-block rounded-full border border-brand-yellow bg-brand-yellow/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-orange">
              {meta.month || "—"}
            </span>
          </div>
        </div>
      </header>

      <div className="header-rule h-1 w-full" />

      <section className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        <Field label="Tutor Name" value={tutor.name} />
        <Field label="Tutor ID" value={tutor.id} />
        <Field label="Mentor" value={meta.mentor || "—"} />
        <Field label="Team Leader" value={meta.teamLeader || "—"} />
      </section>

      <div className="border-b border-border bg-secondary/60 px-8 py-2 text-xs font-semibold text-primary sm:px-9">
        Evaluation Month: <span className="font-bold">{meta.month || "—"}</span>
      </div>

      <section className="px-8 py-5 sm:px-9">
        <h3 className="text-sm font-bold text-primary">KPI Breakdown</h3>
        <table className="mt-2.5 w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col />
            <col className="w-[70px]" />
            <col className="w-[60px]" />
            <col className="w-[70px]" />
          </colgroup>
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="rounded-l-lg px-3 py-2 text-left text-xs font-semibold">
                Key Performance Indicator
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold">Score</th>
              <th className="px-2 py-2 text-center text-xs font-semibold">Max</th>
              <th className="rounded-r-lg px-2 py-2 text-center text-xs font-semibold">%</th>
            </tr>
          </thead>
          <tbody>
            {KPI_DEFINITIONS.map((kpi) => {
              const value = tutor[kpi.key] ?? 0;
              return (
                <tr key={kpi.key} className="border-b border-border last:border-0">
                  <td className="px-3 py-1.5 align-middle">
                    <p className="text-[13px] font-semibold leading-tight text-foreground">
                      {kpi.label}
                    </p>
                    <p className="text-[11px] leading-tight text-muted-foreground">
                      {kpi.description}
                    </p>
                  </td>
                  <td className="px-2 py-1.5 text-center align-middle text-sm font-bold text-primary">
                    {value}
                  </td>
                  <td className="px-2 py-1.5 text-center align-middle text-xs text-muted-foreground">
                    {kpi.max}
                  </td>
                  <td className="px-2 py-1.5 text-center align-middle text-xs font-semibold text-brand-orange">
                    {Math.round((value / kpi.max) * 100)}%
                  </td>
                </tr>
              );
            })}
            <tr className="border-b border-border bg-secondary/40">
              <td className="px-3 py-1.5 align-middle">
                <p className="text-[13px] font-semibold leading-tight text-foreground">
                  Quality Score (from sheet)
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  Monthly quality rating
                </p>
              </td>
              <td className="px-2 py-1.5 text-center align-middle text-sm font-bold text-primary">
                {breakdown.quality ?? "—"}
              </td>
              <td className="px-2 py-1.5 text-center align-middle text-xs text-muted-foreground">
                {QUALITY_MAX}
              </td>
              <td className="px-2 py-1.5 text-center align-middle text-xs font-semibold text-brand-orange">
                {breakdown.quality === null
                  ? "—"
                  : `${Math.round((breakdown.quality / QUALITY_MAX) * 100)}%`}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary px-5 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">KPI Score</p>
            <p className="text-lg font-bold leading-tight text-primary">
              {formatScore(breakdown.kpiScore)} <span className="text-sm font-medium text-muted-foreground">/ {KPI_WEIGHT}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Quality Points</p>
            <p className="text-lg font-bold leading-tight text-primary">
              {breakdown.qualityScore === null ? "—" : formatScore(breakdown.qualityScore)} <span className="text-sm font-medium text-muted-foreground">/ {QUALITY_WEIGHT}</span>
            </p>
            <p className="text-[10px] text-muted-foreground">from {breakdown.quality ?? "—"} / {QUALITY_MAX}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Total Score</p>
            <p className="text-xl font-bold leading-tight text-primary">
              {formatScore(score)} <span className="text-sm font-medium text-muted-foreground">/ {FINAL_SCORE_MAX}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Percentage</p>
            <p className="text-xl font-bold leading-tight text-brand-orange">{percentage.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">
            {ratingLabel(percentage)}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-bold text-primary">Evaluation Feedback</h3>
          <div className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-background px-4 py-3 text-[13px] leading-snug text-foreground">
            {meta.feedback?.trim() || "No feedback provided for this evaluation period."}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 items-end gap-6 border-t border-border pt-4 text-[11px] text-muted-foreground">
          <div>
            <p className="mb-5">Mentor Signature</p>
            <p className="border-t border-border pt-1">{meta.mentor || " "}</p>
          </div>
          <div>
            <p className="mb-5">Team Leader Signature</p>
            <p className="border-t border-border pt-1">{meta.teamLeader || " "}</p>
          </div>
          <p className="text-right">iSchool · Official Evaluation Document</p>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-5 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
