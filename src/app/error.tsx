"use client";

import { useEffect } from "react";
import { ButtonLink, Icon, buttonClass } from "@/components/ui";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div role="alert" className="w-full max-w-md rounded-3xl border border-line bg-card p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-flag/10 text-flag">
          <Icon name="info" className="h-7 w-7" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-medium tracking-tight">Something went wrong</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">That wasn&apos;t supposed to happen. Try again, or head back to the start.</p>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" onClick={retry} className={buttonClass("primary")}>
            Try again
          </button>
          <ButtonLink href="/" variant="secondary">
            Back to start
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
