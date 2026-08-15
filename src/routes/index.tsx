import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, Pencil, X } from "lucide-react";
import logoAsset from "@/assets/ischool-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TutorSearch } from "@/components/TutorSearch";
import { ReportSheet, type ReportMeta } from "@/components/ReportSheet";
import { type Tutor } from "@/lib/kpi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iSchool Tutor KPI & Culture Fit Reports" },
      {
        name: "description",
        content:
          "Search an iSchool tutor, review their monthly KPI and culture fit scores, add mentor feedback and export a polished A4 evaluation report.",
      },
      { property: "og:title", content: "iSchool Tutor KPI & Culture Fit Reports" },
      {
        property: "og:description",
        content:
          "Generate professional monthly iSchool tutor evaluation reports with KPI breakdowns, total score and mentor feedback.",
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

function currentMonthLabel() {
  const now = new Date();
  return `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

function Index() {
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [editing, setEditing] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [meta, setMeta] = useState<ReportMeta>({
    mentor: "",
    teamLeader: "",
    month: currentMonthLabel(),
    feedback: "",
  });

  const update = (patch: Partial<ReportMeta>) => setMeta((m) => ({ ...m, ...patch }));

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
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const data = canvas.toDataURL("image/png");
      if (imgHeight <= pageHeight - margin * 2) {
        pdf.addImage(data, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        let remaining = imgHeight;
        let offset = 0;
        while (remaining > 0) {
          pdf.addImage(data, "PNG", margin, margin - offset, imgWidth, imgHeight);
          remaining -= pageHeight - margin * 2;
          offset += pageHeight - margin * 2;
          if (remaining > 0) pdf.addPage();
        }
      }
      pdf.save(`iSchool-KPI-${tutor.id}-${meta.month.replace(/\s+/g, "-")}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="brand-gradient">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-card px-3 py-2">
              <img src={logoAsset.url} alt="iSchool" className="h-8 w-auto" />
            </div>
            <div className="text-primary-foreground">
              <h1 className="text-lg font-bold leading-tight sm:text-xl">
                Tutor KPI &amp; Culture Fit Reports
              </h1>
              <p className="text-sm opacity-85">Monthly evaluation generator</p>
            </div>
          </div>
          <span className="rounded-full bg-brand-yellow px-4 py-1.5 text-sm font-semibold text-foreground">
            {meta.month}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <section className="rounded-2xl bg-card p-6 shadow-card">
          <Label className="text-sm font-semibold text-primary">Select tutor</Label>
          <div className="mt-3">
            <TutorSearch
              value={tutor}
              onSelect={(t) => {
                setTutor(t);
                setEditing(true);
              }}
            />
          </div>

          {tutor && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="mentor">Mentor</Label>
                <Input
                  id="mentor"
                  className="mt-1.5"
                  value={meta.mentor}
                  disabled={!editing}
                  onChange={(e) => update({ mentor: e.target.value })}
                  placeholder="Mentor name"
                />
              </div>
              <div>
                <Label htmlFor="leader">Team Leader</Label>
                <Input
                  id="leader"
                  className="mt-1.5"
                  value={meta.teamLeader}
                  disabled={!editing}
                  onChange={(e) => update({ teamLeader: e.target.value })}
                  placeholder="Team leader name"
                />
              </div>
              <div>
                <Label htmlFor="month">Evaluation Month</Label>
                <Input
                  id="month"
                  className="mt-1.5"
                  value={meta.month}
                  disabled={!editing}
                  onChange={(e) => update({ month: e.target.value })}
                  placeholder="e.g. August 2026"
                />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="feedback">Mentor Feedback</Label>
                <Textarea
                  id="feedback"
                  className="mt-1.5 min-h-28"
                  value={meta.feedback}
                  disabled={!editing}
                  onChange={(e) => update({ feedback: e.target.value })}
                  placeholder="Write the mentor's feedback for this evaluation period…"
                />
              </div>
            </div>
          )}
        </section>

        {tutor ? (
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-primary">Report preview</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing((v) => !v)}>
                  {editing ? <X /> : <Pencil />}
                  {editing ? "Done editing" : "Edit report"}
                </Button>
                <Button onClick={handleExport} disabled={exporting}>
                  <Download />
                  {exporting ? "Preparing…" : "Save as PDF"}
                </Button>
              </div>
            </div>
            <ReportSheet tutor={tutor} meta={meta} />
          </section>
        ) : (
          <section className="mt-8 rounded-2xl border border-dashed border-accent bg-card/60 px-6 py-16 text-center">
            <FileText className="mx-auto mb-3 size-8 text-brand-sky" />
            <p className="font-semibold text-foreground">No tutor selected yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Search by tutor name or ID to load their KPI scores and build the report.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
