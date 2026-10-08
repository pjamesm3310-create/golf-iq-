"use client";

import { useSavedAssessment } from "@/lib/use-saved-assessment";
import { ButtonLink, Icon } from "./ui";

/** Primary calls to action; offers the saved plan when this browser already has one. */
export function HomeActions() {
  const saved = useSavedAssessment();
  const hasPlan = saved.status === "ready";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {hasPlan ? (
        <>
          <ButtonLink href="/plan" className="sm:px-8">
            View your plan
            <Icon name="arrow-right" className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/assessment" variant="secondary">
            Retake the assessment
          </ButtonLink>
        </>
      ) : (
        <>
          <ButtonLink href="/assessment" className="sm:px-8">
            Start your assessment
            <Icon name="arrow-right" className="h-4 w-4" />
          </ButtonLink>
          <p className="text-sm text-ink-muted sm:ml-2">About 2 minutes · No sign-up</p>
        </>
      )}
    </div>
  );
}
