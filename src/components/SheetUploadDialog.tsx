import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tutor } from "@/lib/kpi";
import {
  analyzeSheet,
  buildTutorsFromSheet,
  FIELD_LABELS,
  mergeTutors,
  REQUIRED_FIELDS,
  type FieldKey,
  type SheetAnalysis,
  type SyncSummary,
} from "@/lib/sheet-import";

const NONE = "__none__";

export function SheetUploadDialog({
  currentTutors,
  onSynced,
}: {
  currentTutors: Tutor[];
  onSynced: (merged: Tutor[], summary: SyncSummary) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [analysis, setAnalysis] = useState<SheetAnalysis | null>(null);
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, string>>>({});
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const result = await analyzeSheet(file);
      if (!result.rows.length) {
        setError("The sheet appears to be empty.");
        return;
      }
      setFileName(file.name);
      setAnalysis(result);
      setMapping(result.mapping);
      setOpen(true);
    } catch {
      setError("Could not read that file. Please upload a valid .xlsx, .xls or .csv sheet.");
    } finally {
      setBusy(false);
    }
  };

  const preview = analysis
    ? (() => {
        const { tutors, errors } = buildTutorsFromSheet(analysis, mapping);
        const merged = mergeTutors(currentTutors, tutors);
        return { tutors, errors, ...merged };
      })()
    : null;

  const missingRequired = REQUIRED_FIELDS.filter((f) => !mapping[f]);

  const confirm = () => {
    if (!analysis || !preview) return;
    onSynced(preview.merged, {
      detected: preview.tutors.length,
      added: preview.added,
      updated: preview.updated,
      unchanged: preview.unchanged,
      errors: preview.errors,
    });
    setOpen(false);
    setAnalysis(null);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={pick}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pick()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`upload-surface group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          dragging
            ? "border-brand-sky shadow-card"
            : "border-accent hover:border-primary hover:shadow-card"
        }`}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {busy ? <FileSpreadsheet className="size-5" /> : <Upload className="size-5" />}
        </span>
        <p className="mt-3 text-sm font-bold text-primary">
          {busy ? "Reading sheet…" : "Upload / Update Sheet"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Drag &amp; drop your file here, or click to browse
        </p>
        <span className="mt-3 rounded-full bg-brand-lightblue/50 px-3 py-1 text-[11px] font-semibold text-primary">
          .xlsx · .xls · .csv
        </span>
      </div>

      {error && (
        <p className="mt-2 flex items-start gap-2 text-xs font-medium text-destructive">
          <AlertTriangle className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      )}


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review sheet synchronization</DialogTitle>
            <DialogDescription>
              {fileName} · {analysis?.rows.length ?? 0} rows detected. Confirm the column mapping
              before updating tutor data.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(FIELD_LABELS) as FieldKey[]).map((field) => (
              <div key={field}>
                <Label className="text-xs">
                  {FIELD_LABELS[field]}
                  {REQUIRED_FIELDS.includes(field) && (
                    <span className="text-destructive"> *</span>
                  )}
                </Label>
                <Select
                  value={mapping[field] ?? NONE}
                  onValueChange={(v) =>
                    setMapping((m) => ({ ...m, [field]: v === NONE ? undefined : v }))
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Not mapped" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Not mapped</SelectItem>
                    {analysis?.headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {preview && (
            <div className="rounded-xl bg-secondary/70 p-4 text-sm">
              <p className="flex items-center gap-2 font-bold text-primary">
                <CheckCircle2 className="size-4" /> Sync preview
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-1 text-xs text-foreground sm:grid-cols-4">
                <li>New tutors: <b>{preview.added}</b></li>
                <li>Updated: <b>{preview.updated}</b></li>
                <li>Unchanged: <b>{preview.unchanged}</b></li>
                <li>Errors: <b>{preview.errors}</b></li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Tutors missing from this sheet are kept. Mentor, team leader, month and feedback
                you entered are never overwritten.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={missingRequired.length > 0}>
              {missingRequired.length
                ? `Map ${missingRequired.map((f) => FIELD_LABELS[f]).join(", ")}`
                : "Confirm & synchronize"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
