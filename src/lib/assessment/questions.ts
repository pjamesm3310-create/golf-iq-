import type { AssessmentAnswers } from "./types";

// The assessment, one question per screen. The UI renders from this list and the
// validator uses the same option values, so the two cannot drift apart.

export interface ChoiceOption<V extends string = string> {
  value: V;
  label: string;
  detail?: string;
}

type ChoiceKey = Exclude<keyof AssessmentAnswers, "score" | "venues">;

interface BaseQuestion {
  section: "Your game" | "Your round" | "Your practice";
  title: string;
  help?: string;
}

export type Question =
  | (BaseQuestion & { kind: "score"; key: "score" })
  | (BaseQuestion & { kind: "choice"; key: ChoiceKey; options: ChoiceOption[] })
  | (BaseQuestion & { kind: "multi"; key: "venues"; options: ChoiceOption[] });

export const SCORE_LIMITS = { min: 55, max: 160 } as const;
export const HANDICAP_LIMITS = { min: -10, max: 54 } as const;

export const QUESTIONS: Question[] = [
  {
    kind: "score",
    key: "score",
    section: "Your game",
    title: "What do you usually shoot?",
    help: "Your typical 18-hole score, or your handicap index if you have one. A rough number is fine.",
  },
  {
    kind: "choice",
    key: "roundsPerMonth",
    section: "Your game",
    title: "How often do you play?",
    options: [
      { value: "rarely", label: "Less than once a month" },
      { value: "1-2", label: "1–2 rounds a month" },
      { value: "3-4", label: "About once a week" },
      { value: "5+", label: "More than once a week" },
    ],
  },
  {
    kind: "choice",
    key: "perceivedWeakness",
    section: "Your game",
    title: "Which part of your game feels weakest?",
    help: "Go with your gut. We'll check it against your numbers.",
    options: [
      { value: "driving", label: "Tee shots", detail: "Slices, hooks, lost balls" },
      { value: "approach", label: "Approach shots", detail: "Irons and hybrids into the green" },
      { value: "shortGame", label: "Short game", detail: "Chips, pitches, bunkers" },
      { value: "putting", label: "Putting" },
      { value: "strategy", label: "Decision-making", detail: "Big numbers, risky shots" },
      { value: "unsure", label: "Honestly, not sure" },
    ],
  },
  {
    kind: "choice",
    key: "teeInPlay",
    section: "Your round",
    title: "How often does your tee shot end up in play?",
    help: "In play means fairway or light rough with a clear next shot.",
    options: [
      { value: "most", label: "Most of the time", detail: "10 or more of 14 holes" },
      { value: "half", label: "About half the time" },
      { value: "few", label: "Less than half", detail: "Trees, hazards, recovery shots" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    kind: "choice",
    key: "penalties",
    section: "Your round",
    title: "How many penalty strokes in a typical round?",
    help: "Out of bounds, water, lost balls, unplayable lies.",
    options: [
      { value: "0-1", label: "0–1" },
      { value: "2-3", label: "2–3" },
      { value: "4+", label: "4 or more" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    kind: "choice",
    key: "greens",
    section: "Your round",
    title: "How many greens do you hit in regulation?",
    help: "On the green in 1 shot on a par 3, 2 on a par 4, 3 on a par 5.",
    options: [
      { value: "0-2", label: "0–2 greens" },
      { value: "3-5", label: "3–5 greens" },
      { value: "6-9", label: "6–9 greens" },
      { value: "10+", label: "10 or more" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    kind: "choice",
    key: "approachMiss",
    section: "Your round",
    title: "When an approach shot misses, what usually happens?",
    options: [
      { value: "short", label: "It comes up short" },
      { value: "long", label: "It flies long" },
      { value: "sideways", label: "It goes left or right" },
      { value: "contact", label: "I mishit it", detail: "Fat, thin, or off the toe" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    kind: "choice",
    key: "chipProximity",
    section: "Your round",
    title: "From just off the green, how often do you leave an easy putt?",
    help: "Easy means inside about 6 feet — two steps.",
    options: [
      { value: "usually", label: "Usually" },
      { value: "sometimes", label: "Sometimes" },
      { value: "rarely", label: "Rarely" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    kind: "choice",
    key: "putts",
    section: "Your round",
    title: "How many putts in a typical round?",
    options: [
      { value: "under30", label: "Under 30" },
      { value: "30-33", label: "30–33" },
      { value: "34-37", label: "34–37" },
      { value: "38+", label: "38 or more" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    kind: "choice",
    key: "threePutts",
    section: "Your round",
    title: "How many three-putts (or worse) per round?",
    options: [
      { value: "0-1", label: "0–1" },
      { value: "2-3", label: "2–3" },
      { value: "4+", label: "4 or more" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    kind: "choice",
    key: "blowUps",
    section: "Your round",
    title: "How many double bogeys or worse per round?",
    options: [
      { value: "0-2", label: "0–2" },
      { value: "3-5", label: "3–5" },
      { value: "6+", label: "6 or more" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    kind: "choice",
    key: "weeklyPractice",
    section: "Your practice",
    title: "How much time can you practise each week?",
    help: "Be realistic — a plan you'll actually follow beats an ambitious one.",
    options: [
      { value: "30", label: "About 30 minutes" },
      { value: "60", label: "About an hour" },
      { value: "120", label: "About 2 hours" },
      { value: "180", label: "3 hours or more" },
    ],
  },
  {
    kind: "multi",
    key: "venues",
    section: "Your practice",
    title: "Where can you practise?",
    help: "Choose all that apply. Your drills will fit what you have.",
    options: [
      { value: "range", label: "Driving range" },
      { value: "shortGame", label: "Chipping area", detail: "Or a short-game area with a bunker" },
      { value: "puttingGreen", label: "Putting green" },
      { value: "home", label: "At home", detail: "Living room, garden, or garage" },
    ],
  },
];

export function optionValues(key: ChoiceKey | "venues"): string[] {
  const question = QUESTIONS.find((q) => q.key === key);
  if (!question || question.kind === "score") return [];
  return question.options.map((o) => o.value);
}
