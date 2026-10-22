import type { ReactNode } from "react";
import { FEEDBACK_FORM_URL } from "@/lib/feedback";

/** External link to the feedback form. Opens in a new tab only when clicked. */
export function FeedbackLink({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <a
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-fairway ${className}`}
    >
      {children}
      <span className="sr-only"> (opens Google Forms in a new tab)</span>
    </a>
  );
}
