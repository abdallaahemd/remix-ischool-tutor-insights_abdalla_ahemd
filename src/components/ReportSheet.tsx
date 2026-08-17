import logoAsset from "@/assets/ischool-logo.png.asset.json";
import {
  KPI_DEFINITIONS,
  MAX_TOTAL,
  ratingLabel,
  totalPercentage,
  totalScore,
  type Tutor,
} from "@/lib/kpi";

export type ReportMeta = {
  mentor: string;
  teamLeader: string;
  month: string;
  feedback: string;
};

export function ReportSheet({ tutor, meta }: { tutor: Tutor; meta: ReportMeta }) {
  const score = totalScore(tutor);
  const percentage = totalPercentage(tutor);

  return (
    <div
      id="report-sheet"
      className="mx-auto w-full max-w-[820px] overflow-hidden rounded-2xl bg-card shadow-report"
    >
      <header className="report-header px-8 py-8 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={logoAsset.url} alt="iSchool" className="h-11 w-auto" />
            <span className="hidden h-10 w-px bg-accent sm:block" />
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
            <p className="text-lg font-bold tracking-tight text-primary sm:text-xl">
              Monthly Tutor Evaluation Report
            </p>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              KPI &amp; Culture Fit Assessment
            </p>
            <span className="mt-2 inline-block rounded-full border border-brand-yellow bg-brand-yellow/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-orange">
              {meta.month || "—"}
            </span>
          </div>
        </div>
      </header>

      <div className="header-rule h-1.5 w-full" />


      <section className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        <Field label="Tutor Name" value={tutor.name} />
        <Field label="Tutor ID" value={tutor.id} />
        <Field label="Mentor" value={meta.mentor || "—"} />
        <Field label="Team Leader" value={meta.teamLeader || "—"} />
      </section>

      <div className="border-b border-border bg-secondary/60 px-8 py-3 text-sm font-semibold text-primary sm:px-10">
        Evaluation Month: <span className="font-bold">{meta.month || "—"}</span>
      </div>

      <section className="px-8 py-7 sm:px-10">
        <h3 className="text-base font-bold text-primary">KPI Breakdown</h3>
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="rounded-l-lg px-4 py-3 text-left font-semibold">
                Key Performance Indicator
              </th>
              <th className="px-4 py-3 text-center font-semibold">Score</th>
              <th className="px-4 py-3 text-center font-semibold">Max</th>
              <th className="rounded-r-lg px-4 py-3 text-center font-semibold">%</th>
            </tr>
          </thead>
          <tbody>
            {KPI_DEFINITIONS.map((kpi) => {
              const value = tutor[kpi.key] ?? 0;
              return (
                <tr key={kpi.key} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{kpi.label}</p>
                    <p className="text-xs text-muted-foreground">{kpi.description}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-base font-bold text-primary">
                    {value}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{kpi.max}</td>
                  <td className="px-4 py-3 text-center font-semibold text-brand-orange">
                    {Math.round((value / kpi.max) * 100)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-secondary px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total Score
            </p>
            <p className="text-2xl font-bold text-primary">
              {score} <span className="text-base font-medium text-muted-foreground">/ {MAX_TOTAL}</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Percentage
            </p>
            <p className="text-2xl font-bold text-brand-orange">{percentage.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            {ratingLabel(percentage)}
          </div>
        </div>

        <div className="mt-7">
          <h3 className="text-base font-bold text-primary">Evaluation Feedback</h3>
          <div className="mt-3 min-h-28 whitespace-pre-wrap rounded-xl border border-border bg-background px-5 py-4 text-sm leading-relaxed text-foreground">
            {meta.feedback?.trim() || "No feedback provided for this evaluation period."}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-border pt-5 text-xs text-muted-foreground">
          <div>
            <p className="mb-6">Mentor Signature</p>
            <p className="w-48 border-t border-border pt-1">{meta.mentor || " "}</p>
          </div>
          <div>
            <p className="mb-6">Team Leader Signature</p>
            <p className="w-48 border-t border-border pt-1">{meta.teamLeader || " "}</p>
          </div>
          <p className="ml-auto">iSchool · Official Evaluation Document</p>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-6 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
