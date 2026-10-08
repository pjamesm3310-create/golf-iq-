import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "lime";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-pine text-white hover:bg-pine-2 disabled:bg-ink-muted/40 disabled:text-white/80",
  secondary: "border border-line bg-card text-ink hover:border-ink-muted/50 hover:bg-white",
  ghost: "text-ink-soft hover:bg-sand/70 hover:text-ink",
  lime: "bg-lime text-pine hover:bg-[#d6ec86]",
};

export function buttonClass(variant: Variant = "primary", extra = ""): string {
  return [
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold",
    "transition-colors duration-150 disabled:cursor-not-allowed",
    VARIANTS[variant],
    extra,
  ].join(" ");
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const text = tone === "dark" ? "text-ink" : "text-white";
  return (
    <Link href="/" className={`inline-flex items-center gap-2 rounded-md ${text}`} aria-label="GolfIQ home">
      <FlagMark className="h-7 w-7" onDark={tone === "light"} />
      <span className="font-display text-[22px] font-semibold tracking-tight">
        Golf<span className={tone === "dark" ? "text-fairway" : "text-lime"}>IQ</span>
      </span>
    </Link>
  );
}

export function FlagMark({ className = "", onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill={onDark ? "#2b6a48" : "#0f3325"} />
      <path d="M13 8v16" stroke="#fffdf8" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 8.5l8 3.2-8 3.3z" fill="#c9e36f" />
      <ellipse cx="13" cy="24.2" rx="4" ry="1.1" fill={onDark ? "#c9e36f" : "#2b6a48"} fillOpacity={onDark ? 0.6 : 1} />
    </svg>
  );
}

type IconName = "arrow-left" | "arrow-right" | "check" | "close" | "clock" | "pin" | "target" | "refresh" | "info";

const PATHS: Record<IconName, ReactNode> = {
  "arrow-left": <path d="M15 18l-6-6 6-6" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0113 0c0 4.8-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  refresh: <path d="M19.5 12a7.5 7.5 0 11-2.2-5.3M19.5 4.5v4h-4" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 7.6v.2" />
    </>
  ),
};

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
