"use client";

import { useEffect, useState } from "react";
import { getPlanProvider } from "@/lib/assessment/provider";
import type { ImprovementPlan } from "@/lib/assessment/types";
import { clearAssessment } from "@/lib/storage";
import { useSavedAssessment } from "@/lib/use-saved-assessment";
import { PlanDashboard } from "./plan-dashboard";
import { ButtonLink, FlagMark, Icon, Logo, buttonClass } from "./ui";

type Generated = { key: string; plan: ImprovementPlan } | { key: string; failed: true };

export function PlanView() {
  const saved = useSavedAssessment();
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [attempt, setAttempt] = useState(0);

  const key = saved.status === "ready" ? `${saved.raw}#${attempt}` : null;

  useEffect(() => {
    if (saved.status !== "ready" || key === null) return;
    let cancelled = false;
    getPlanProvider()
      .createPlan(saved.answers)
      .then((plan) => {
        if (!cancelled) setGenerated({ key, plan });
      })
      .catch((error: unknown) => {
        console.error("Plan generation failed", error);
        if (!cancelled) setGenerated({ key, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [saved, key]);

  if (saved.status === "loading") return <PlanLoading />;
  if (saved.status === "empty") return <PlanEmpty />;
  if (saved.status === "invalid") {
    return (
      <PlanProblem
        title="We couldn't read your saved assessment"
        message="The answers stored in this browser are incomplete or from an older version. Retaking the assessment takes about two minutes."
        onStartOver={clearAssessment}
      />
    );
  }

  if (!generated || generated.key !== key) return <PlanLoading />;
  if ("failed" in generated) {
    return (
      <PlanProblem
        title="Something went wrong building your plan"
        message="Your answers are still saved. Try again, or retake the assessment if it keeps happening."
        onRetry={() => setAttempt((n) => n + 1)}
        onStartOver={clearAssessment}
      />
    );
  }

  return <PlanDashboard plan={generated.plan} venues={saved.answers.venues} completedAt={saved.completedAt} />;
}

function PlanShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
        <Logo />
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pb-16 sm:px-6">
        {children}
      </main>
    </div>
  );
}

function PlanLoading() {
  return (
    <div className="min-h-dvh" role="status" aria-live="polite">
      <span className="sr-only">Building your plan…</span>
      <div className="bg-pine pb-16" aria-hidden="true">
        <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
          <div className="h-7 w-28 rounded-full bg-white/10" />
          <div className="mt-14 space-y-4 animate-pulse-soft">
            <div className="h-3 w-40 rounded-full bg-lime/40" />
            <div className="h-10 w-full max-w-xl rounded-xl bg-white/15" />
            <div className="h-10 w-2/3 max-w-md rounded-xl bg-white/15" />
            <div className="mt-8 h-16 w-48 rounded-xl bg-white/10" />
          </div>
        </div>
      </div>
      <div className="mx-auto -mt-8 grid max-w-5xl gap-4 px-4 sm:px-6 lg:grid-cols-5" aria-hidden="true">
        <div className="h-64 rounded-3xl border border-line bg-card animate-pulse-soft lg:col-span-3" />
        <div className="h-64 rounded-3xl border border-line bg-card animate-pulse-soft lg:col-span-2" />
      </div>
    </div>
  );
}

function PlanEmpty() {
  return (
    <PlanShell>
      <div className="w-full max-w-md animate-rise rounded-3xl border border-line bg-card p-8 text-center shadow-sm sm:p-10">
        <FlagMark className="mx-auto h-14 w-14" />
        <h1 className="mt-6 font-display text-3xl font-medium tracking-tight">No plan yet</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Answer 13 quick questions and we&apos;ll find the biggest thing costing you strokes — then build a plan
          around the time you have.
        </p>
        <ButtonLink href="/assessment" className="mt-8 w-full">
          Start the assessment
          <Icon name="arrow-right" className="h-4 w-4" />
        </ButtonLink>
        <p className="mt-3 text-sm text-ink-muted">About 2 minutes · No sign-up</p>
      </div>
    </PlanShell>
  );
}

function PlanProblem({
  title,
  message,
  onRetry,
  onStartOver,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  onStartOver: () => void;
}) {
  return (
    <PlanShell>
      <div role="alert" className="w-full max-w-md animate-rise rounded-3xl border border-line bg-card p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-flag/10 text-flag">
          <Icon name="info" className="h-7 w-7" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-medium tracking-tight">{title}</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">{message}</p>
        <div className="mt-8 flex flex-col gap-3">
          {onRetry && (
            <button type="button" onClick={onRetry} className={buttonClass("primary")}>
              <Icon name="refresh" className="h-4 w-4" />
              Try again
            </button>
          )}
          <ButtonLink href="/assessment" variant={onRetry ? "secondary" : "primary"} onClick={onStartOver}>
            Retake the assessment
          </ButtonLink>
        </div>
      </div>
    </PlanShell>
  );
}
