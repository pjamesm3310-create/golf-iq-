import { HANDICAP_LIMITS, QUESTIONS, SCORE_LIMITS, optionValues } from "./questions";
import type { AssessmentAnswers, ScoreInput } from "./types";

export type ParseResult =
  | { ok: true; answers: AssessmentAnswers }
  | { ok: false; errors: string[] };

/**
 * Parses a raw score/handicap entry typed by the user.
 * Handicaps written as "+2" are plus handicaps and become -2.
 */
export function parseScoreEntry(
  kind: ScoreInput["kind"],
  raw: string,
): { ok: true; value: ScoreInput } | { ok: false; error: string } {
  const text = raw.trim();
  if (text === "") {
    return { ok: false, error: kind === "score" ? "Enter your typical score." : "Enter your handicap index." };
  }

  if (kind === "score") {
    if (!/^\d{2,3}$/.test(text)) return { ok: false, error: "Enter a whole number, like 92." };
    const value = Number(text);
    if (value < SCORE_LIMITS.min || value > SCORE_LIMITS.max) {
      return { ok: false, error: `Enter a score between ${SCORE_LIMITS.min} and ${SCORE_LIMITS.max}.` };
    }
    return { ok: true, value: { kind, value } };
  }

  if (!/^[+-]?\d{1,2}(\.\d)?$/.test(text)) {
    return { ok: false, error: "Enter a handicap like 18 or 12.4 (use +2 for a plus handicap)." };
  }
  const value = text.startsWith("+") ? -Number(text.slice(1)) : Number(text);
  if (value < HANDICAP_LIMITS.min || value > HANDICAP_LIMITS.max) {
    return { ok: false, error: `Enter a handicap between +${-HANDICAP_LIMITS.min} and ${HANDICAP_LIMITS.max}.` };
  }
  return { ok: true, value: { kind, value } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validScore(value: unknown): value is ScoreInput {
  if (!isRecord(value) || typeof value.value !== "number" || !Number.isFinite(value.value)) return false;
  if (value.kind === "score") {
    return Number.isInteger(value.value) && value.value >= SCORE_LIMITS.min && value.value <= SCORE_LIMITS.max;
  }
  if (value.kind === "handicap") {
    return value.value >= HANDICAP_LIMITS.min && value.value <= HANDICAP_LIMITS.max;
  }
  return false;
}

/** Validates untrusted input (form state or saved data) into a complete set of answers. */
export function parseAnswers(input: unknown): ParseResult {
  if (!isRecord(input)) return { ok: false, errors: ["Answers are missing."] };

  const errors: string[] = [];
  for (const question of QUESTIONS) {
    const value = input[question.key];
    if (question.kind === "score") {
      if (!validScore(value)) errors.push("score");
    } else if (question.kind === "multi") {
      const allowed = optionValues(question.key);
      const ok =
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((v) => typeof v === "string" && allowed.includes(v)) &&
        new Set(value).size === value.length;
      if (!ok) errors.push(question.key);
    } else if (typeof value !== "string" || !optionValues(question.key).includes(value)) {
      errors.push(question.key);
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  // Copy only known keys so stray properties never travel further.
  const answers = Object.fromEntries(QUESTIONS.map((q) => [q.key, input[q.key]])) as unknown as AssessmentAnswers;
  return { ok: true, answers: { ...answers, score: { ...answers.score }, venues: [...answers.venues] } };
}
