"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseAnswers } from "./assessment/validate";
import type { AssessmentAnswers } from "./assessment/types";
import {
  readSavedAssessment,
  readSavedAssessmentOnServer,
  subscribeToAssessment,
  unwrapSaved,
} from "./storage";

export type SavedAssessment =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "ready"; raw: string; answers: AssessmentAnswers; completedAt: string | null };

export function useSavedAssessment(): SavedAssessment {
  const raw = useSyncExternalStore(subscribeToAssessment, readSavedAssessment, readSavedAssessmentOnServer);

  return useMemo<SavedAssessment>(() => {
    if (raw === undefined) return { status: "loading" };
    if (raw === null) return { status: "empty" };
    const saved = unwrapSaved(raw);
    if (!saved) return { status: "invalid" };
    const parsed = parseAnswers(saved.answers);
    if (!parsed.ok) return { status: "invalid" };
    return { status: "ready", raw, answers: parsed.answers, completedAt: saved.completedAt };
  }, [raw]);
}
