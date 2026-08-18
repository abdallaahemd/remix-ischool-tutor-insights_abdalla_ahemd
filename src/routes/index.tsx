import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  LayoutDashboard,
  Pencil,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import logoAsset from "@/assets/ischool-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TutorSearch } from "@/components/TutorSearch";
import { PersonSelect } from "@/components/PersonSelect";
import { SheetUploadDialog } from "@/components/SheetUploadDialog";
import { ReportSheet, type ReportMeta } from "@/components/ReportSheet";
import { KPI_DEFINITIONS, MAX_TOTAL, type KpiKey, type Tutor } from "@/lib/kpi";
import type { SyncSummary } from "@/lib/sheet-import";
import { formatSyncTime, useTutorStore } from "@/lib/tutor-store";
import { MENTORS, TEAM_LEADERS, normalizeNames } from "@/lib/people";
import { generateFeedback as generateFeedbackFn } from "@/lib/feedback.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iSchool Tutor KPI & Culture Fit Reports" },
      {
        name: "description",
        content:
          "Upload your tutor KPI sheet, sync scores, edit evaluations and export polished A4 iSchool monthly reports.",
      },
      { property: "og:title", content: "iSchool Tutor KPI & Culture Fit Reports" },
      {
        property: "og:description",
        content:
          "Sync tutor KPI sheets and generate professional monthly iSchool evaluation reports with PDF export.",
      },
    ],
  }),
  component: Index,
});

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const FEEDBACK_TYPES = [
  "Outstanding Ideas",
  "Collaboration",
  "Attendance/Meetings",
  "Working Hours",
  "Innovation",
  "Performance Improvement",
  "Needs Improvement",
  "General",
];

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "search", label: "Tutor Search", icon: Search },
  { id: "upload", label: "Upload / Update Sheet", icon: Upload },
  { id: "sync", label: "Sync Status", icon: RefreshCw },
  { id: "evaluation", label: "Tutor Evaluation", icon: Sliders },
  { id: "report", label: "Report Preview", icon: FileText },
];

function Index() {
  const { tutors, lastSynced, applySync } = useTutorStore();
  const [summary, setSummary] = useState<SyncSummary | null>(null);

  const [tutorId, setTutorId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Partial<Record<KpiKey, number>>>({});
  const [editing, setEditing] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mentors, setMentors] = useState<string[]>(MENTORS);
  const [leaders, setLeaders] = useState<string[]>(TEAM_LEADERS);
  const [feedbackType, setFeedbackType] = useState<string>("General");
  const [rawFeedback, setRawFeedback] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ReportMeta>({
    mentor: "",
    teamLeader: "",
    month: MONTHS[new Date().getMonth()] ?? "January",
    feedback: "",
  });

  const baseTutor = useMemo(
    () => tutors.find((t) => t.id === tutorId) ?? null,
    [tutors, tutorId],
  );

  const tutor: Tutor | null = useMemo(
    () => (baseTutor ? { ...baseTutor, ...overrides } : null),
    [baseTutor, overrides],
  );

  const update = (patch: Partial<ReportMeta>) => setMeta((m) => ({ ...m, ...patch }));

  const handleGenerateFeedback = async () => {
    if (!rawFeedback.trim()) return;
    setGenerating(true);
    setAiError(null);
    try {
      const res = await generateFeedbackFn({
        data: {
          feedbackType,
          rawFeedback: rawFeedback.trim(),
          tutorName: tutor?.name,
          month: meta.month,
        },
      });
      update({ feedback: res.text });
    } catch {
      setAiError("Could not generate feedback. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!tutor) return;
    setExporting(true);
    try {
      const node = document.getElementById("report-sheet");
      if (!node) return;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff" });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;
      // Always fit the whole report on a single page (scale down when needed)
      const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const data = canvas.toDataURL("image/png");
      pdf.addImage(data, "PNG", (pageWidth - imgWidth) / 2, margin, imgWidth, imgHeight);
      pdf.save(`iSchool-KPI-${tutor.id}-${meta.month.replace(/\s+/g, "-")}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b-2 border-brand-yellow bg-card/95 backdrop-blur">
        <div className="flex items-center gap-4 px-5 py-3">
          <img src={logoAsset.url} alt="iSchool" className="h-9 w-auto" />
          <div className="hidden border-l border-border pl-4 sm:block">
            <p className="text-sm font-bold text-primary">Tutor KPI &amp; Culture Fit</p>
            <p className="text-xs text-muted-foreground">Monthly evaluation reports</p>
          </div>
          <span className="ml-auto rounded-full bg-brand-yellow px-4 py-1.5 text-xs font-bold text-foreground">
            {meta.month}
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="sticky top-24 hidden h-fit w-60 shrink-0 rounded-2xl bg-card p-3 shadow-card lg:block">
          <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Navigation
          </p>
          <nav className="space-y-1">
            {NAV.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                <Icon className="size-4 text-brand-sky" />
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-4 rounded-xl bg-secondary/70 px-3 py-3 text-xs">
            <p className="font-semibold text-primary">Tutors loaded</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{tutors.length}</p>
            <p className="mt-2 text-muted-foreground">Last synced: {formatSyncTime(lastSynced)}</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <section
            id="dashboard"
            className="overflow-hidden rounded-2xl bg-card shadow-card"
          >
            <div className="brand-gradient px-6 py-7">
              <h1 className="text-xl font-bold text-primary-foreground sm:text-2xl">
                Tutor KPI &amp; Culture Fit Dashboard
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-primary-foreground/85">
                Upload your latest KPI sheet, review scores, add mentor feedback and export a
                polished iSchool evaluation report.
              </p>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2" id="upload">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-brand-sky">
                  Sheet source
                </Label>
                <div className="mt-2">
                  <SheetUploadDialog
                    currentTutors={tutors}
                    onSynced={(merged, s) => {
                      applySync(merged);
                      setSummary(s);
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Columns are detected automatically by name — you can review the mapping before
                  syncing.
                </p>
              </div>

              <div id="sync" className="rounded-xl bg-secondary/60 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-primary">
                  <RefreshCw className="size-4" /> Sync status
                </p>
                {summary ? (
                  <>
                    <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-brand-orange">
                      <CheckCircle2 className="size-3.5" /> Sheet sync complete ·{" "}
                      {summary.detected} tutors detected
                    </p>
                    <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">
                      <li>New tutors: <b>{summary.added}</b></li>
                      <li>Updated: <b>{summary.updated}</b></li>
                      <li>Unchanged: <b>{summary.unchanged}</b></li>
                      <li>Errors: <b>{summary.errors}</b></li>
                    </ul>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Using the current tutor dataset. Upload a sheet to synchronize.
                  </p>
                )}
                <p className="mt-3 text-xs font-medium text-foreground">
                  Last Synced: {formatSyncTime(lastSynced)}
                </p>
              </div>
            </div>
          </section>

          <section id="search" className="rounded-2xl bg-card p-6 shadow-card">
            <Label className="text-sm font-semibold text-primary">Select tutor</Label>
            <div className="mt-3">
              {tutors.length ? (
                <TutorSearch
                  tutors={tutors}
                  value={baseTutor}
                  onSelect={(t) => {
                    setTutorId(t.id);
                    setOverrides({});
                    setEditing(true);
                    setGenerated(false);
                  }}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-accent bg-secondary/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  No tutors yet — upload a KPI sheet above to load tutor IDs and names.
                </div>
              )}
            </div>
          </section>

          {tutor && (
            <section id="evaluation" className="rounded-2xl bg-card p-6 shadow-card">
              <h2 className="text-base font-bold text-primary">Tutor evaluation</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>Mentor</Label>
                  <PersonSelect
                    value={meta.mentor}
                    options={mentors}
                    placeholder="Select mentor"
                    disabled={!editing}
                    onChange={(v) => update({ mentor: v })}
                    onAddOption={(v) => setMentors((m) => normalizeNames([...m, v]))}
                  />
                </div>
                <div>
                  <Label>Team Leader</Label>
                  <PersonSelect
                    value={meta.teamLeader}
                    options={leaders}
                    placeholder="Select team leader"
                    disabled={!editing}
                    onChange={(v) => update({ teamLeader: v })}
                    onAddOption={(v) => setLeaders((l) => normalizeNames([...l, v]))}
                  />
                </div>
                <div>
                  <Label>Evaluation Month</Label>
                  <Select
                    value={meta.month}
                    disabled={!editing}
                    onValueChange={(v) => update({ month: v })}
                  >
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-primary">KPI scores</Label>
                  <span className="text-xs text-muted-foreground">
                    Total {KPI_DEFINITIONS.reduce((s, k) => s + (tutor[k.key] ?? 0), 0)} /{" "}
                    {MAX_TOTAL}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {KPI_DEFINITIONS.map((kpi) => (
                    <div key={kpi.key} className="rounded-xl border border-border p-3">
                      <p className="text-xs font-semibold text-foreground">{kpi.label}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={kpi.max}
                          step={0.5}
                          disabled={!editing}
                          value={tutor[kpi.key] ?? 0}
                          onChange={(e) =>
                            setOverrides((o) => ({
                              ...o,
                              [kpi.key]: Math.min(
                                kpi.max,
                                Math.max(0, Number(e.target.value) || 0),
                              ),
                            }))
                          }
                        />
                        <span className="text-xs font-semibold text-muted-foreground">
                          / {kpi.max}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <Label>Feedback Type</Label>
                  <Select
                    value={feedbackType}
                    disabled={!editing}
                    onValueChange={setFeedbackType}
                  >
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Label htmlFor="raw-feedback" className="mt-4 block">
                    Your notes
                  </Label>
                  <Textarea
                    id="raw-feedback"
                    className="mt-1.5 min-h-28"
                    value={rawFeedback}
                    disabled={!editing}
                    onChange={(e) => setRawFeedback(e.target.value)}
                    placeholder="Write your raw notes — the AI will rewrite them professionally…"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!editing || generating || !rawFeedback.trim()}
                      onClick={handleGenerateFeedback}
                    >
                      <Sparkles />
                      {generating ? "Generating…" : "Generate Feedback"}
                    </Button>
                    {aiError && (
                      <span className="text-xs font-medium text-destructive">{aiError}</span>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="feedback">Evaluation Feedback</Label>
                  <Textarea
                    id="feedback"
                    className="mt-1.5 min-h-[15.5rem]"
                    value={meta.feedback}
                    disabled={!editing}
                    onChange={(e) => update({ feedback: e.target.value })}
                    placeholder="The generated feedback appears here and stays fully editable…"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    This exact text appears in the report and the exported PDF.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setGenerated(true);
                    setEditing(false);
                    document.getElementById("report")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <FileText /> Generate Report
                </Button>
                {generated && (
                  <>
                    <Button variant="outline" onClick={() => setEditing((v) => !v)}>
                      {editing ? <X /> : <Pencil />}
                      {editing ? "Done editing" : "Edit Report"}
                    </Button>
                    <Button variant="secondary" onClick={handleExport} disabled={exporting}>
                      <Download />
                      {exporting ? "Preparing…" : "Save as PDF"}
                    </Button>
                  </>
                )}
              </div>
            </section>
          )}

          <section id="report">
            {tutor && generated ? (
              <ReportSheet tutor={tutor} meta={meta} />
            ) : (
              <div className="rounded-2xl border border-dashed border-accent bg-card/60 px-6 py-16 text-center">
                <FileText className="mx-auto mb-3 size-8 text-brand-sky" />
                <p className="font-semibold text-foreground">
                  {tutor ? "Report not generated yet" : "No tutor selected yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tutor
                    ? "Complete the evaluation details, then click Generate Report."
                    : "Search by tutor name or ID to load their KPI scores."}
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
