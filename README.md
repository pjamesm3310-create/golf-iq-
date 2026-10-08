# GolfIQ

A short golf assessment that finds the biggest thing costing a golfer strokes and
builds a simple, personalised practice plan for it.

Milestone 1 scope: assessment → rule-based recommendation → plan dashboard.
No backend, accounts, payments, or AI provider. Answers are stored only in the
browser's `localStorage`.

## How plans are generated

`src/lib/assessment/engine.ts` is a deterministic, rule-based model. It compares
the golfer's answers with approximate amateur benchmarks
(`src/lib/assessment/benchmarks.ts`) for their next scoring milestone, estimates
strokes lost in five areas, and builds a plan for the largest. It is not AI.

The UI only talks to `getPlanProvider()` in `src/lib/assessment/provider.ts`;
an AI-backed provider can implement the same `PlanProvider` interface later.

## Scripts

```bash
npm run dev        # start the dev server
npm test           # engine and validation tests (Vitest)
npm run typecheck
npm run lint
npm run build
```
