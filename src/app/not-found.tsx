import { ButtonLink, FlagMark } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <FlagMark className="mx-auto h-14 w-14" />
        <h1 className="mt-6 font-display text-3xl font-medium tracking-tight">Out of bounds</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">This page doesn&apos;t exist. No penalty — head back to the tee.</p>
        <ButtonLink href="/" className="mt-8">
          Back to start
        </ButtonLink>
      </div>
    </main>
  );
}
