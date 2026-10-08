import type { AreaEstimate, Drill, DrillVenue, ImprovementPlan, Venue } from "@/lib/assessment/types";
import { clearAssessment } from "@/lib/storage";
import { ButtonLink, Icon, Logo } from "./ui";

const VENUE_LABEL: Record<DrillVenue, string> = {
  range: "Driving range",
  shortGame: "Chipping area",
  puttingGreen: "Putting green",
  home: "At home",
  course: "On the course",
};

function strokes(n: number): string {
  return n < 0.5 ? "<0.5" : n.toFixed(1);
}

export function PlanDashboard({
  plan,
  venues,
  completedAt,
}: {
  plan: ImprovementPlan;
  venues: Venue[];
  completedAt: string | null;
}) {
  const { priority, target, golfer, confidence } = plan;
  const drillNumber = new Map(plan.drills.map((d, i) => [d.id, i + 1]));
  const assessedOn = completedAt ? formatDate(completedAt) : null;

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="on-dark relative overflow-hidden bg-pine pb-20 text-white sm:pb-24">
        <HeroBackdrop />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Logo tone="light" />
            <ButtonLink href="/assessment" variant="ghost" className="min-h-10 px-4 text-white/85 hover:bg-white/10 hover:text-white">
              <Icon name="refresh" className="h-4 w-4" />
              Retake
            </ButtonLink>
          </div>

          <div className="animate-rise pt-10 sm:pt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime">
              Your #1 priority · {priority.label}
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-[38px] leading-[1.05] font-medium tracking-tight sm:text-6xl">
              {priority.headline}
            </h1>

            <div className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-6">
              <div>
                <p className="font-display text-7xl leading-none font-medium tracking-tight text-lime sm:text-8xl">
                  {strokes(priority.strokes)}
                </p>
                <p className="mt-3 text-sm text-white/75">
                  estimated strokes a round, compared with golfers at your goal
                </p>
              </div>
              <dl className="flex flex-wrap gap-2 pb-1 text-sm">
                <Pill label="You shoot about" value={String(golfer.typicalScore)} note={golfer.fromHandicap ? "from handicap" : undefined} />
                <Pill label="Goal" value={target.label} />
                <Pill label="Confidence" value={cap(confidence.level)} />
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-12 max-w-5xl space-y-5 px-4 sm:px-6">
        {/* Why + breakdown */}
        <div className="grid gap-5 lg:grid-cols-5">
          <Card className="lg:col-span-3" delay={60}>
            {plan.insight.text && <Insight kind={plan.insight.kind} text={plan.insight.text} />}
            <SectionTitle eyebrow="The diagnosis">Why this is your priority</SectionTitle>
            <ul className="mt-5 space-y-4">
              {priority.reasons.map((reason) => (
                <li key={reason} className="flex gap-3 leading-relaxed text-ink-soft">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fairway" aria-hidden="true" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 border-t border-line pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">What&apos;s going on</h3>
              <p className="mt-3 leading-relaxed text-ink">{priority.explanation}</p>
            </div>
          </Card>

          <Card className="lg:col-span-2" delay={120}>
            <SectionTitle eyebrow="Estimated strokes a round">Where your strokes go</SectionTitle>
            <StrokeBars areas={plan.areas} priority={priority.area} />
            <p className="mt-5 text-xs leading-relaxed text-ink-muted">
              Compared with typical golfers who {target.label.toLowerCase()}.
              {plan.areas.some((a) => a.assumed) && " Areas marked “typical” used an average figure because you weren't sure."}
            </p>
          </Card>
        </div>

        {/* Goal */}
        <Card delay={160} className="!bg-fairway-soft/70 border-fairway/20">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pine text-lime">
                <Icon name="target" className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fairway">Your goal</p>
                <p className="mt-1 font-display text-2xl leading-snug font-medium tracking-tight sm:text-[28px]">
                  {plan.goal.statement}
                </p>
                <p className="mt-2 text-sm text-ink-soft">{plan.goal.timeframe}</p>
              </div>
            </div>
            <p className="rounded-2xl bg-card/80 px-4 py-3 text-sm leading-relaxed text-ink-soft sm:max-w-xs">
              <span className="font-semibold text-ink">How to track it: </span>
              {plan.goal.measure}
            </p>
          </div>
        </Card>

        {/* Plan */}
        <Card delay={200}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionTitle eyebrow="Your practice plan">Four weeks, built around your time</SectionTitle>
            <p className="flex items-center gap-1.5 text-sm font-medium text-ink-soft">
              <Icon name="clock" className="h-4 w-4" />
              {plan.schedule.sessionsPerWeek} × {plan.schedule.minutesPerSession} min a week
            </p>
          </div>

          <ol className="mt-6 grid gap-3 md:grid-cols-3">
            {plan.schedule.phases.map((phase, i) => (
              <li key={phase.weeks} className="rounded-2xl border border-line bg-paper/60 p-5">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-pine text-xs font-bold text-lime">
                    {i + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{phase.weeks}</span>
                </div>
                <p className="mt-3 font-semibold">{phase.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{phase.detail}</p>
              </li>
            ))}
          </ol>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-ink-muted">Each week</h3>
          {plan.schedule.sessions.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {plan.schedule.sessions.map((session) => (
                <div key={session.name} className="rounded-2xl border border-line p-5">
                  <p className="flex items-baseline justify-between">
                    <span className="font-semibold">{session.name}</span>
                    <span className="text-sm text-ink-muted">{session.minutes} min</span>
                  </p>
                  <ul className="mt-3 space-y-2">
                    {session.blocks.map((block) => {
                      const drill = plan.drills.find((d) => d.id === block.drillId);
                      return (
                        <li key={block.drillId} className="flex items-center gap-3 text-sm">
                          <span className="w-12 shrink-0 font-semibold tabular-nums text-fairway">{block.minutes} min</span>
                          <a href={`#drill-${block.drillId}`} className="rounded text-ink underline decoration-line underline-offset-4 hover:decoration-fairway">
                            {drillNumber.get(block.drillId)}. {drill?.name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-2xl border border-line p-5 text-sm leading-relaxed text-ink-soft">
              This plan is practised on the course. Use the drills below in your next rounds.
            </p>
          )}
        </Card>

        {/* Drills */}
        <section aria-labelledby="drills-heading" className="pt-4">
          <div className="px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fairway">Your drills</p>
            <h2 id="drills-heading" className="mt-1 font-display text-3xl font-medium tracking-tight">
              {plan.drills.length} drills, chosen for you
            </h2>
          </div>
          <div className={`mt-5 grid gap-5 ${plan.drills.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
            {plan.drills.map((drill, i) => (
              <DrillCard key={drill.id} drill={drill} number={i + 1} available={drill.venue === "course" || venues.includes(drill.venue)} />
            ))}
          </div>
        </section>

        {/* Tip + method */}
        <div className="grid gap-5 pt-4 md:grid-cols-2">
          <Card className="!bg-pine text-white on-dark">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">On the course</p>
            <p className="mt-3 font-display text-xl leading-snug">{priority.courseTip}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">How this plan was made</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              GolfIQ uses a rule-based scoring model — not AI — that compares your answers with approximate benchmarks
              for amateur golfers at your next milestone. The numbers are estimates to point you in the right
              direction, not precise statistics.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">{cap(confidence.level)} confidence. </span>
              {confidence.note}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Your answers are saved only in this browser{assessedOn ? ` (assessed ${assessedOn})` : ""}.{" "}
              <button
                type="button"
                onClick={clearAssessment}
                className="rounded font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-flag"
              >
                Delete my answers
              </button>
            </p>
          </Card>
        </div>

        {/* Next step */}
        <div className="flex flex-col items-center gap-4 pt-10 text-center">
          <p className="max-w-md leading-relaxed text-ink-soft">{plan.checkIn}</p>
          <ButtonLink href="/assessment" variant="secondary">
            <Icon name="refresh" className="h-4 w-4" />
            Retake the assessment
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <section
      className={`animate-rise rounded-3xl border border-line bg-card p-6 shadow-[0_1px_2px_rgba(19,38,29,0.04),0_8px_24px_-12px_rgba(19,38,29,0.12)] sm:p-8 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

function SectionTitle({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fairway">{eyebrow}</p>
      <h2 className="mt-1 font-display text-2xl font-medium tracking-tight sm:text-[28px]">{children}</h2>
    </div>
  );
}

function Pill({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2.5">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-white/60">{label}</dt>
      <dd className="mt-0.5 font-semibold">
        {value}
        {note && <span className="ml-1.5 text-xs font-normal text-white/60">{note}</span>}
      </dd>
    </div>
  );
}

function Insight({ kind, text }: { kind: ImprovementPlan["insight"]["kind"]; text: string }) {
  const tone =
    kind === "match"
      ? "bg-fairway-soft/70 text-ink"
      : kind === "mismatch"
        ? "bg-[#f6ead2] text-ink"
        : "bg-sand/70 text-ink";
  const title = kind === "match" ? "Your instinct was right" : kind === "mismatch" ? "Not what you expected" : "Good to know";
  return (
    <div className={`mb-7 flex gap-3 rounded-2xl p-4 ${tone}`}>
      <Icon name={kind === "match" ? "check" : "info"} className="mt-0.5 h-5 w-5 shrink-0 text-fairway" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
      </div>
    </div>
  );
}

function StrokeBars({ areas, priority }: { areas: AreaEstimate[]; priority: AreaEstimate["area"] }) {
  const max = Math.max(1, ...areas.map((a) => a.strokes));
  return (
    <ul className="mt-6 space-y-5">
      {areas.map((area, i) => {
        const isPriority = area.area === priority;
        return (
          <li key={area.area}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={isPriority ? "font-semibold text-ink" : "text-ink-soft"}>
                {area.label}
                {area.assumed && <span className="ml-2 text-xs text-ink-muted">typical</span>}
              </span>
              <span className={`tabular-nums ${isPriority ? "font-semibold text-ink" : "text-ink-soft"}`}>
                <span className="sr-only">about </span>
                {strokes(area.strokes)}
                <span className="sr-only"> strokes a round</span>
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
              <div
                className={`h-full origin-left animate-grow rounded-full ${isPriority ? "bg-pine" : "bg-fairway/45"}`}
                style={{ width: `${Math.max(2, (area.strokes / max) * 100)}%`, animationDelay: `${200 + i * 70}ms` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DrillCard({ drill, number, available }: { drill: Drill; number: number; available: boolean }) {
  return (
    <article
      id={`drill-${drill.id}`}
      className="flex scroll-mt-6 flex-col rounded-3xl border border-line bg-card p-6 shadow-[0_1px_2px_rgba(19,38,29,0.04)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-4xl leading-none font-medium text-fairway/35">{String(number).padStart(2, "0")}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sand/80 px-3 py-1 text-xs font-medium text-ink-soft">
          <Icon name="pin" className="h-3.5 w-3.5" />
          {VENUE_LABEL[drill.venue]}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{drill.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{drill.summary}</p>
      {!available && (
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          You didn&apos;t list this as somewhere you can practise — worth it if you get the chance.
        </p>
      )}
      <ol className="mt-5 space-y-3 text-sm leading-relaxed">
        {drill.steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-xs font-semibold text-ink-soft">
              {i + 1}
            </span>
            <span className="text-ink">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-auto pt-5">
        <span className="block rounded-2xl bg-fairway-soft/60 px-4 py-3 text-sm leading-relaxed">
          <span className="font-semibold text-fairway">Success: </span>
          {drill.success}
        </span>
      </p>
    </article>
  );
}

function HeroBackdrop() {
  // Contour lines suggesting a green's topography. Purely decorative.
  return (
    <svg
      className="pointer-events-none absolute -right-40 -top-24 h-[560px] w-[760px] text-white/[0.06] sm:-right-20"
      viewBox="0 0 760 560"
      fill="none"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <ellipse key={i} cx="430" cy="250" rx={90 + i * 46} ry={60 + i * 32} stroke="currentColor" strokeWidth="1.5" transform={`rotate(${-12 + i * 2} 430 250)`} />
      ))}
      <circle cx="430" cy="250" r="6" fill="#c9e36f" fillOpacity="0.5" />
    </svg>
  );
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}
