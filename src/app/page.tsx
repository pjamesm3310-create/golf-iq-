import { HomeActions } from "@/components/home-actions";
import { Icon, Logo } from "@/components/ui";

const STEPS = [
  {
    title: "Tell us how you play",
    body: "Your typical score, a few round stats, and how much time you can practise. Rough numbers are fine.",
  },
  {
    title: "See where strokes go",
    body: "We estimate what tee shots, approaches, short game, putting and decision-making cost you against golfers at your next milestone.",
  },
  {
    title: "Fix one thing",
    body: "A clear goal, a four-week plan sized to your week, and drills that fit where you can practise.",
  },
];

const EXAMPLE = [
  { label: "Short game", value: 2.4 },
  { label: "Putting", value: 1.4 },
  { label: "Tee shots", value: 1.1 },
  { label: "Decision-making", value: 0.6 },
  { label: "Approach shots", value: 0.5 },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Logo />
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-8 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pb-24">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-fairway">
              <span className="h-1.5 w-1.5 rounded-full bg-fairway" aria-hidden="true" />
              Golf improvement assessment
            </p>
            <h1 className="mt-6 font-display text-[44px] leading-[1.02] font-medium tracking-tight text-ink sm:text-6xl lg:text-[68px]">
              Find the one thing costing you the most strokes.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Answer 13 quick questions about your game. Get your biggest leak, a clear goal, and a practice plan
              built around the time you actually have.
            </p>
            <div className="mt-9">
              <HomeActions />
            </div>
          </div>

          <ExampleCard />
        </section>

        <section className="border-t border-line bg-card/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">How it works</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <span className="font-display text-5xl leading-none font-medium text-fairway/35">0{i + 1}</span>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm leading-relaxed text-ink-muted sm:px-6">
          <p>
            Plans are built by a transparent rule-based model using approximate amateur benchmarks — not AI, and not a
            swing analysis.
          </p>
          <p>No account needed. Your answers stay in this browser.</p>
        </div>
      </footer>
    </div>
  );
}

function ExampleCard() {
  return (
    <figure
      className="on-dark relative animate-rise overflow-hidden rounded-[28px] bg-pine p-7 text-white shadow-[0_30px_60px_-30px_rgba(15,51,37,0.6)] sm:p-9"
      style={{ animationDelay: "120ms" }}
      aria-label="Example result for a golfer who shoots about 95"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime">Example result</p>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">Shoots ~95</span>
      </div>
      <p className="mt-6 text-sm text-white/65">Your #1 priority</p>
      <p className="mt-1 font-display text-3xl leading-tight font-medium tracking-tight">Turn missed greens into easy putts</p>
      <p className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-5xl font-medium text-lime">2.4</span>
        <span className="text-sm text-white/70">strokes a round vs. golfers who break 90</span>
      </p>
      <ul className="mt-7 space-y-3" aria-label="Estimated strokes by area">
        {EXAMPLE.map((row, i) => (
          <li key={row.label} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3 text-sm">
            <span className={i === 0 ? "font-semibold" : "text-white/70"}>{row.label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <span
                className={`block h-full origin-left animate-grow rounded-full ${i === 0 ? "bg-lime" : "bg-white/35"}`}
                style={{ width: `${(row.value / 2.4) * 100}%`, animationDelay: `${300 + i * 70}ms` }}
              />
            </span>
            <span className="text-right tabular-nums text-white/80">{row.value.toFixed(1)}</span>
          </li>
        ))}
      </ul>
      <figcaption className="mt-7 flex items-center gap-2 border-t border-white/10 pt-5 text-sm text-white/70">
        <Icon name="target" className="h-4 w-4 text-lime" />
        Goal: get 4 of every 10 chips inside 6 feet
      </figcaption>
    </figure>
  );
}
