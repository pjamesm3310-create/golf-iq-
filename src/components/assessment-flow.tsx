"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { QUESTIONS, type Question } from "@/lib/assessment/questions";
import type { AssessmentAnswers, ScoreInput } from "@/lib/assessment/types";
import { parseAnswers, parseScoreEntry } from "@/lib/assessment/validate";
import { saveAssessment } from "@/lib/storage";
import { Icon, buttonClass } from "./ui";

type Draft = Partial<Record<keyof AssessmentAnswers, unknown>>;

const ADVANCE_DELAY_MS = 220;

export function AssessmentFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [scoreKind, setScoreKind] = useState<ScoreInput["kind"]>("score");
  const [scoreText, setScoreText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const movedRef = useRef(false);
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = QUESTIONS[step];
  const total = QUESTIONS.length;
  const isLast = step === total - 1;

  // Next keeps this route mounted but hidden after navigating away, and runs effect
  // cleanups when it hides. Reset there so coming back starts a fresh assessment.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (doneRef.current) {
        doneRef.current = false;
        movedRef.current = false;
        setStep(0);
        setDraft({});
        setScoreKind("score");
        setScoreText("");
        setError(null);
        setSubmitting(false);
      }
    },
    [],
  );

  // Move focus to the new question so keyboard and screen-reader users land in the right place.
  useEffect(() => {
    if (movedRef.current) headingRef.current?.focus();
  }, [step]);

  function goTo(next: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    movedRef.current = true;
    setError(null);
    setStep(Math.max(0, Math.min(total - 1, next)));
  }

  function choose(value: string) {
    if (question.kind !== "choice") return;
    setDraft((d) => ({ ...d, [question.key]: value }));
    setError(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => goTo(step + 1), ADVANCE_DELAY_MS);
  }

  function toggleVenue(value: string) {
    setDraft((d) => {
      const current = Array.isArray(d.venues) ? (d.venues as string[]) : [];
      const venues = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...d, venues };
    });
    setError(null);
  }

  function submit() {
    const result = parseAnswers(draft);
    if (!result.ok) {
      const firstBad = QUESTIONS.findIndex((q) => result.errors.includes(q.key));
      if (firstBad === step) {
        setError(question.kind === "multi" ? "Choose at least one place you can practise." : "Please answer this question.");
      } else {
        goTo(firstBad);
        setError("Please answer this question before building your plan.");
      }
      return;
    }
    setSubmitting(true);
    if (!saveAssessment(result.answers)) {
      setSubmitting(false);
      setError(
        "We couldn't save your answers on this device. Your browser may be blocking site storage — private browsing often does.",
      );
      return;
    }
    doneRef.current = true;
    router.push("/plan");
  }

  function next(event?: FormEvent) {
    event?.preventDefault();
    if (question.kind === "score") {
      const parsed = parseScoreEntry(scoreKind, scoreText);
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      setDraft((d) => ({ ...d, score: parsed.value }));
      goTo(step + 1);
      return;
    }
    if (isLast) {
      submit();
      return;
    }
    if (draft[question.key] === undefined) {
      setError("Choose an answer to continue.");
      return;
    }
    goTo(step + 1);
  }

  const answered =
    question.kind === "score"
      ? scoreText.trim() !== ""
      : question.kind === "multi"
        ? Array.isArray(draft.venues) && draft.venues.length > 0
        : draft[question.key] !== undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-line/70 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 0}
            className="grid h-11 w-11 place-items-center rounded-full text-ink-soft transition hover:bg-sand disabled:invisible"
            aria-label="Previous question"
          >
            <Icon name="arrow-left" />
          </button>
          <div className="flex-1">
            <div className="mb-1.5 flex items-baseline justify-between text-xs font-medium tracking-wide text-ink-muted">
              <span className="uppercase">{question.section}</span>
              <span>
                {step + 1} of {total}
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-sand"
              role="progressbar"
              aria-label="Assessment progress"
              aria-valuemin={1}
              aria-valuemax={total}
              aria-valuenow={step + 1}
              aria-valuetext={`Question ${step + 1} of ${total}`}
            >
              <div
                className="h-full rounded-full bg-fairway transition-[width] duration-500 ease-out"
                style={{ width: `${((step + 1) / total) * 100}%` }}
              />
            </div>
          </div>
          <Link
            href="/"
            className="grid h-11 w-11 place-items-center rounded-full text-ink-soft transition hover:bg-sand"
            aria-label="Exit assessment"
          >
            <Icon name="close" />
          </Link>
        </div>
      </header>

      <form onSubmit={next} className="flex flex-1 flex-col" noValidate>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10 pt-8 sm:px-6 sm:pt-14">
          <div key={step} className="animate-rise">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-[28px] leading-[1.15] font-medium tracking-tight text-ink outline-none sm:text-4xl"
            >
              {question.title}
            </h1>
            {question.help && <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-soft">{question.help}</p>}

            <div className="mt-8">
              <QuestionBody
                question={question}
                draft={draft}
                scoreKind={scoreKind}
                scoreText={scoreText}
                error={error}
                onScoreKind={(k) => {
                  setScoreKind(k);
                  setError(null);
                }}
                onScoreText={(t) => {
                  setScoreText(t);
                  setError(null);
                }}
                onChoose={choose}
                onToggle={toggleVenue}
              />
            </div>

            {error && question.kind !== "score" && (
              <p role="alert" className="mt-5 rounded-xl bg-flag/10 px-4 py-3 text-sm font-medium text-flag">
                {error}
              </p>
            )}
          </div>
        </main>

        <footer className="sticky bottom-0 border-t border-line/70 bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="hidden text-sm text-ink-muted sm:block">
              {question.kind === "choice" ? "Pick one to continue" : isLast ? "Last question" : " "}
            </p>
            <button
              type="submit"
              disabled={submitting}
              className={buttonClass("primary", `w-full sm:w-auto ${answered ? "" : "opacity-70"}`)}
            >
              {isLast ? (submitting ? "Building your plan…" : "Build my plan") : "Continue"}
              {!submitting && <Icon name="arrow-right" className="h-4 w-4" />}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function QuestionBody({
  question,
  draft,
  scoreKind,
  scoreText,
  error,
  onScoreKind,
  onScoreText,
  onChoose,
  onToggle,
}: {
  question: Question;
  draft: Draft;
  scoreKind: ScoreInput["kind"];
  scoreText: string;
  error: string | null;
  onScoreKind: (k: ScoreInput["kind"]) => void;
  onScoreText: (t: string) => void;
  onChoose: (value: string) => void;
  onToggle: (value: string) => void;
}) {
  const inputId = useId();
  const errorId = useId();

  if (question.kind === "score") {
    return (
      <div>
        <div role="group" aria-label="Answer with" className="inline-flex rounded-full bg-sand p-1">
          {(["score", "handicap"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={scoreKind === kind}
              onClick={() => onScoreKind(kind)}
              className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${
                scoreKind === kind ? "bg-card text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              {kind === "score" ? "Typical score" : "Handicap index"}
            </button>
          ))}
        </div>
        <label htmlFor={inputId} className="mt-6 block text-sm font-medium text-ink-soft">
          {scoreKind === "score" ? "Typical 18-hole score" : "Handicap index"}
        </label>
        <input
          id={inputId}
          // Auto-focus here is expected: this is the first and only field on the screen.
          autoFocus
          inputMode={scoreKind === "score" ? "numeric" : "decimal"}
          autoComplete="off"
          value={scoreText}
          onChange={(e) => onScoreText(e.target.value)}
          placeholder={scoreKind === "score" ? "e.g. 94" : "e.g. 18.4"}
          maxLength={5}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`mt-2 block w-full max-w-xs rounded-2xl border-2 bg-card px-5 py-4 font-display text-4xl tracking-tight text-ink outline-none transition placeholder:text-ink-muted/40 focus:border-fairway ${
            error ? "border-flag" : "border-line"
          }`}
        />
        {error ? (
          <p id={errorId} role="alert" className="mt-3 text-sm font-medium text-flag">
            {error}
          </p>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">
            {scoreKind === "score" ? "Between 55 and 160." : "Use +2 for a plus handicap."}
          </p>
        )}
      </div>
    );
  }

  if (question.kind === "multi") {
    const selected = Array.isArray(draft.venues) ? (draft.venues as string[]) : [];
    return (
      <div role="group" aria-label={question.title} className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const on = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(option.value)}
              className={optionClass(on)}
            >
              <OptionText label={option.label} detail={option.detail} />
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition ${
                  on ? "border-fairway bg-fairway text-white" : "border-line bg-card"
                }`}
              >
                {on && <Icon name="check" className="h-4 w-4" />}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  const current = draft[question.key];
  return (
    <div role="group" aria-label={question.title} className="grid gap-3">
      {question.options.map((option) => {
        const on = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChoose(option.value)}
            className={optionClass(on)}
          >
            <OptionText label={option.label} detail={option.detail} />
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
                on ? "border-fairway bg-fairway text-white" : "border-line bg-card"
              }`}
            >
              {on && <Icon name="check" className="h-3.5 w-3.5" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function optionClass(on: boolean) {
  return [
    "flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left transition duration-150",
    on
      ? "border-fairway bg-fairway-soft/60"
      : "border-line bg-card hover:-translate-y-px hover:border-ink-muted/40 hover:shadow-sm",
  ].join(" ");
}

function OptionText({ label, detail }: { label: string; detail?: string }) {
  return (
    <span>
      <span className="block text-[16px] font-semibold text-ink">{label}</span>
      {detail && <span className="mt-0.5 block text-sm text-ink-muted">{detail}</span>}
    </span>
  );
}
