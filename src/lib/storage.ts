import type { AssessmentAnswers } from "./assessment/types";

// The latest completed assessment lives in localStorage on this device only.
// Only answers are stored; the plan is recomputed from them, so a change to the
// engine never leaves a stale plan behind.

const KEY = "golfiq:assessment:v1";
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToAssessment(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Raw saved value: a string, or null when nothing is saved or storage is unavailable. */
export function readSavedAssessment(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** On the server and during hydration nothing is known yet. */
export function readSavedAssessmentOnServer(): undefined {
  return undefined;
}

export function saveAssessment(answers: AssessmentAnswers): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ answers, completedAt: new Date().toISOString() }));
    emit();
    return true;
  } catch {
    return false;
  }
}

export function clearAssessment(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
  emit();
}

/** Unwraps the stored envelope. Returns the inner answers value, unvalidated. */
export function unwrapSaved(raw: string): { answers: unknown; completedAt: string | null } | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || !("answers" in parsed)) return null;
    const completedAt = "completedAt" in parsed && typeof parsed.completedAt === "string" ? parsed.completedAt : null;
    return { answers: parsed.answers, completedAt };
  } catch {
    return null;
  }
}
