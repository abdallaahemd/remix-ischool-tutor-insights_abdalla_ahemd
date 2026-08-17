import { useCallback, useEffect, useState } from "react";
import { type Tutor } from "@/lib/kpi";

const KEY = "ischool-tutor-data";

type Stored = {
  tutors: Tutor[];
  lastSynced: string | null;
};

export function useTutorStore() {
  const [data, setData] = useState<Stored>({ tutors: [], lastSynced: null });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Stored;
        if (Array.isArray(parsed.tutors) && parsed.tutors.length) setData(parsed);
      }
    } catch {
      /* ignore corrupt cache */
    }
    setHydrated(true);
  }, []);

  const save = useCallback((next: Stored) => {
    setData(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  const applySync = useCallback(
    (merged: Tutor[]) => save({ tutors: merged, lastSynced: new Date().toISOString() }),
    [save],
  );

  const resetToSeed = useCallback(() => {
    save({ tutors: [], lastSynced: null });
  }, [save]);

  return { tutors: data.tutors, lastSynced: data.lastSynced, hydrated, applySync, resetToSeed };
}

export function formatSyncTime(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
