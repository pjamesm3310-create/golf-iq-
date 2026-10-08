import { benchmarkFor, type Benchmark } from "./benchmarks";
import { AREA_CONTENT, type TaggedDrill } from "./content";
import type {
  AreaEstimate,
  AreaId,
  AssessmentAnswers,
  ImprovementPlan,
  PlanSession,
} from "./types";

// Rule-based plan generator. It estimates strokes lost per area by comparing the
// golfer's answers with approximate benchmarks for their next scoring milestone,
// then builds a plan for the largest one. Deterministic: same answers, same plan.

export const AREA_ORDER: AreaId[] = ["driving", "approach", "shortGame", "putting", "strategy"];

/** Points added to the area the golfer feels is weakest, so it wins near-ties only. */
const PERCEIVED_WEIGHT = 0.5;

const TEE_IN_PLAY = { most: 0.75, half: 0.5, few: 0.3 } as const;
const PENALTIES = { "0-1": 0.5, "2-3": 2.5, "4+": 5 } as const;
const GREENS = { "0-2": 1, "3-5": 4, "6-9": 7.5, "10+": 11 } as const;
const CHIPS = { usually: 0.6, sometimes: 0.4, rarely: 0.2 } as const;
const PUTTS = { under30: 29, "30-33": 31.5, "34-37": 35.5, "38+": 39 } as const;
const THREE_PUTTS = { "0-1": 0.5, "2-3": 2.5, "4+": 4.5 } as const;
const BLOW_UPS = { "0-2": 1, "3-5": 4, "6+": 7.5 } as const;

const PERFORMANCE_KEYS = [
  "teeInPlay",
  "penalties",
  "greens",
  "approachMiss",
  "chipProximity",
  "putts",
  "threePutts",
  "blowUps",
] as const;

const ROUNDS_PER_WEEK = { rarely: 0.2, "1-2": 0.35, "3-4": 1, "5+": 2 } as const;

const SCHEDULE = {
  "30": { sessions: 2, minutes: 15 },
  "60": { sessions: 2, minutes: 30 },
  "120": { sessions: 3, minutes: 40 },
  "180": { sessions: 3, minutes: 60 },
} as const;

/** Golfer's stat if they answered, otherwise the typical value for their current level. */
function pick<K extends string>(answer: K | "unsure", table: Record<K, number>, fallback: number): number {
  return answer === "unsure" ? fallback : table[answer];
}

export function typicalScore(answers: AssessmentAnswers): number {
  const { score } = answers;
  if (score.kind === "score") return score.value;
  // A handicap index reflects a golfer's better rounds, so typical scores run a few shots higher.
  return Math.min(160, Math.max(60, Math.round(72 + score.value + 3)));
}

export function targetFor(typical: number): { score: number; label: string; phrase: string } {
  if (typical >= 80) {
    const milestone = Math.floor(typical / 10) * 10;
    return { score: milestone - 1, label: `Break ${milestone}`, phrase: `golfers who break ${milestone}` };
  }
  const score = Math.max(typical - 3, 66);
  return { score, label: `Shoot ${score}`, phrase: `golfers who shoot ${score}` };
}

interface Stats {
  teeInPlay: number;
  penalties: number;
  greens: number;
  chip: number;
  putts: number;
  threePutts: number;
  blowUps: number;
}

function golferStats(answers: AssessmentAnswers, current: Benchmark): Stats {
  return {
    teeInPlay: pick(answers.teeInPlay, TEE_IN_PLAY, current.teeInPlay),
    penalties: pick(answers.penalties, PENALTIES, current.penalties),
    greens: pick(answers.greens, GREENS, current.greens),
    chip: pick(answers.chipProximity, CHIPS, current.chipInside6ft),
    putts: pick(answers.putts, PUTTS, current.putts),
    threePutts: pick(answers.threePutts, THREE_PUTTS, current.threePutts),
    blowUps: pick(answers.blowUps, BLOW_UPS, current.blowUps),
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const over = (a: number, b: number) => Math.max(0, a - b);

export function estimateAreas(answers: AssessmentAnswers, u: Stats, t: Benchmark): AreaEstimate[] {
  const excessPenalties = over(u.penalties, t.penalties);
  const raw: Record<AreaId, { strokes: number; assumed: boolean }> = {
    driving: {
      // Each extra stray tee shot costs about a third of a stroke; most penalties start on the tee.
      strokes: over(t.teeInPlay, u.teeInPlay) * 14 * 0.35 + excessPenalties * 0.7 * 1.2,
      assumed: answers.teeInPlay === "unsure" || answers.penalties === "unsure",
    },
    approach: {
      strokes: over(t.greens, u.greens) * 0.55,
      assumed: answers.greens === "unsure",
    },
    shortGame: {
      strokes: over(t.chipInside6ft, u.chip) * (18 - u.greens) * 0.9,
      assumed: answers.chipProximity === "unsure",
    },
    putting: {
      strokes: over(u.putts, t.putts) * 0.8,
      assumed: answers.putts === "unsure",
    },
    strategy: {
      strokes: over(u.blowUps, t.blowUps) * 0.45 + excessPenalties * 0.3 * 1.2,
      assumed: answers.blowUps === "unsure",
    },
  };

  return AREA_ORDER.map((area) => ({
    area,
    label: AREA_CONTENT[area].label,
    strokes: round1(raw[area].strokes),
    assumed: raw[area].assumed,
  }));
}

/** Highest estimate wins; the golfer's own read breaks near-ties; area order breaks exact ties. */
export function choosePriority(areas: AreaEstimate[], perceived: AssessmentAnswers["perceivedWeakness"]): AreaId {
  let best = areas[0];
  let bestScore = -Infinity;
  for (const estimate of areas) {
    const score = estimate.strokes + (estimate.area === perceived ? PERCEIVED_WEIGHT : 0);
    if (score > bestScore) {
      best = estimate;
      bestScore = score;
    }
  }
  return best.area;
}

function variantFor(area: AreaId, answers: AssessmentAnswers, u: Stats, t: Benchmark): string | null {
  switch (area) {
    case "driving":
      return u.penalties > t.penalties + 0.5 ? "penalties" : "accuracy";
    case "approach":
      if (answers.approachMiss === "short" || answers.approachMiss === "long") return "clubbing";
      if (answers.approachMiss === "sideways") return "direction";
      return "contact";
    case "putting":
      if (answers.threePutts === "unsure") return "lag";
      return u.threePutts > t.threePutts + 0.5 ? "lag" : "short";
    default:
      return null;
  }
}

export function selectDrills(
  area: AreaId,
  variant: string | null,
  venues: AssessmentAnswers["venues"],
  count: number,
): TaggedDrill[] {
  const library = AREA_CONTENT[area].drills;
  const fits = (d: TaggedDrill) => d.venue === "course" || venues.includes(d.venue);
  const suits = (d: TaggedDrill) => d.tags.length === 0 || (variant !== null && d.tags.includes(variant));
  const ranked = library
    .map((drill, index) => ({ drill, index, score: (fits(drill) ? 2 : 0) + (suits(drill) ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.drill);

  // At most one on-course drill while practice drills that fit are still available.
  const chosen: TaggedDrill[] = [];
  for (const drill of ranked) {
    if (chosen.length === count) break;
    const courseAlready = chosen.some((d) => d.venue === "course");
    const practiceLeft = ranked.some((d) => d.venue !== "course" && fits(d) && !chosen.includes(d));
    if (drill.venue === "course" && courseAlready && practiceLeft) continue;
    chosen.push(drill);
  }
  return chosen;
}

const roundTo5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

export function buildSessions(drills: TaggedDrill[], weekly: AssessmentAnswers["weeklyPractice"]): PlanSession[] {
  const { sessions, minutes } = SCHEDULE[weekly];
  const practice = drills.filter((d) => d.venue !== "course").map((d) => d.id);
  if (practice.length === 0) return [];

  // Rotate pairs so each session leads with a different drill where possible.
  const pairs: string[][] =
    practice.length === 1
      ? [[practice[0]]]
      : practice.length === 2
        ? [[practice[0], practice[1]], [practice[1], practice[0]]]
        : [[practice[0], practice[1]], [practice[0], practice[2]], [practice[2], practice[1]]];

  return Array.from({ length: sessions }, (_, i) => {
    const pair = pairs[i % pairs.length];
    const lead = pair.length === 1 ? minutes : roundTo5(minutes * 0.6);
    const blocks = pair.map((drillId, j) => ({ drillId, minutes: j === 0 ? lead : minutes - lead }));
    return { name: `Session ${i + 1}`, minutes, blocks };
  });
}

function count(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function goalFor(area: AreaId, variant: string | null, u: Stats, t: Benchmark) {
  switch (area) {
    case "driving":
      if (variant === "penalties") {
        const limit = Math.max(1, Math.round(t.penalties));
        return {
          statement: `Cut penalty strokes to ${limit} or fewer per round`,
          measure: "Put a dot on your scorecard for every penalty stroke.",
        };
      }
      return {
        statement: `Keep ${Math.min(14, Math.max(Math.round(t.teeInPlay * 14), Math.round(u.teeInPlay * 14) + 1))} of 14 tee shots in play`,
        measure: "Tick each hole where your tee shot leaves a clear next shot.",
      };
    case "approach":
      return {
        statement: `Hit ${Math.min(18, Math.max(Math.ceil(t.greens), Math.round(u.greens) + 1))} or more greens in regulation per round`,
        measure: "Tick a box on your card for every green hit in regulation.",
      };
    case "shortGame":
      return {
        statement: `Get ${Math.min(8, Math.max(Math.round(t.chipInside6ft * 10), Math.round(u.chip * 10) + 1))} of every 10 chips inside 6 feet`,
        measure: "On the course, count chips that finish within two steps of the hole. In practice, score the Up-and-down nine.",
      };
    case "putting":
      if (variant === "lag") {
        return {
          statement: `No more than ${Math.max(0, Math.floor(t.threePutts))} three-putts per round`,
          measure: "Write the number of putts on every hole.",
        };
      }
      return {
        statement: `Average ${Math.round(t.putts)} putts or fewer per round`,
        measure: "Write the number of putts on every hole.",
      };
    case "strategy":
      return {
        statement: `Limit double bogeys or worse to ${Math.max(1, Math.round(t.blowUps))} per round`,
        measure: "Circle every double or worse and note the decision that started it.",
      };
  }
}

function reasonsFor(
  area: AreaId,
  answers: AssessmentAnswers,
  u: Stats,
  t: Benchmark,
  phrase: string,
  typical: number,
): string[] {
  const assumed = (thing: string) =>
    `You weren't sure about ${thing}, so we assumed a typical figure for someone who shoots around ${typical}.`;
  const reasons: string[] = [];

  switch (area) {
    case "driving":
      reasons.push(
        answers.teeInPlay === "unsure"
          ? assumed("how many tee shots stay in play")
          : `You keep about ${Math.round(u.teeInPlay * 14)} of 14 tee shots in play. ${cap(phrase)} manage about ${Math.round(t.teeInPlay * 14)}.`,
      );
      reasons.push(
        answers.penalties === "unsure"
          ? assumed("penalty strokes")
          : `You estimated ${answers.penalties.replace("-", "–")} penalty strokes a round, against about ${count(round1(t.penalties))} for ${phrase}. Each one is a full shot gone before you've hit a bad swing.`,
      );
      break;
    case "approach":
      reasons.push(
        answers.greens === "unsure"
          ? assumed("greens in regulation")
          : `You hit around ${answers.greens.replace("-", "–")} greens in regulation. ${cap(phrase)} average about ${count(round1(t.greens))}.`,
      );
      reasons.push(
        {
          short: "Your misses usually come up short — that's more often club selection than swing.",
          long: "Your misses tend to fly long, which points to yardages you don't fully trust yet.",
          sideways: "Your misses go left and right, so controlling the start line comes first.",
          contact: "Mishits are your usual miss, so solid contact comes before anything else.",
          unsure: "You weren't sure how your approaches miss, so the plan starts with strike quality — the foundation for everything else.",
        }[answers.approachMiss],
      );
      break;
    case "shortGame":
      reasons.push(
        answers.chipProximity === "unsure"
          ? assumed("how close your chips finish")
          : `From just off the green you ${answers.chipProximity} leave an easy putt. ${cap(phrase)} do it about ${Math.round(t.chipInside6ft * 100)}% of the time.`,
      );
      reasons.push(
        `You miss around ${Math.round(18 - u.greens)} greens a round, so this shot comes up on almost every hole.`,
      );
      break;
    case "putting":
      reasons.push(
        answers.putts === "unsure"
          ? assumed("putts per round")
          : `You take around ${answers.putts === "under30" ? "under 30" : answers.putts.replace("-", "–").replace("+", " or more")} putts a round. ${cap(phrase)} average about ${Math.round(t.putts)}.`,
      );
      reasons.push(
        answers.threePutts === "unsure"
          ? assumed("three-putts")
          : `You three-putt ${answers.threePutts.replace("-", "–").replace("+", " or more")} times a round, against about ${count(round1(t.threePutts))} for ${phrase}.`,
      );
      break;
    case "strategy":
      reasons.push(
        answers.blowUps === "unsure"
          ? assumed("double bogeys")
          : `You make ${answers.blowUps.replace("-", "–").replace("+", " or more")} double bogeys or worse a round. ${cap(phrase)} average about ${count(round1(t.blowUps))}.`,
      );
      if (answers.penalties !== "unsure" && u.penalties > t.penalties) {
        reasons.push("Penalty strokes are feeding those big numbers — one bad decision often turns into two or three lost shots.");
      }
      break;
  }
  return reasons;
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function insightFor(
  priority: AreaEstimate,
  areas: AreaEstimate[],
  perceived: AssessmentAnswers["perceivedWeakness"],
): ImprovementPlan["insight"] {
  if (perceived === "unsure") {
    return { kind: "none", text: `You weren't sure which part of your game was weakest. Your answers point to ${priority.label.toLowerCase()}.` };
  }
  if (perceived === priority.area) {
    return { kind: "match", text: `You called it. Your answers agree that ${priority.label.toLowerCase()} is where the most strokes are going.` };
  }
  const felt = areas.find((a) => a.area === perceived);
  if (!felt) return { kind: "none", text: "" };
  const extra =
    perceived === "putting"
      ? " Putts are easy to notice because they finish every hole, but they aren't always where the most strokes go."
      : " It's worth keeping an eye on, but it isn't the biggest leak right now.";
  return {
    kind: "mismatch",
    text: `You said ${felt.label.toLowerCase()} feels weakest. Your answers suggest it costs about ${count(felt.strokes)} strokes a round — less than ${priority.label.toLowerCase()}, at about ${count(priority.strokes)}.${extra}`,
  };
}

function confidenceFor(answers: AssessmentAnswers, typical: number): ImprovementPlan["confidence"] {
  const total = PERFORMANCE_KEYS.length;
  const answered = PERFORMANCE_KEYS.filter((k) => answers[k] !== "unsure").length;
  if (answered >= 6) {
    return { level: "high", answered, total, note: `Based on ${answered} of ${total} round stats you gave us.` };
  }
  if (answered >= 3) {
    return {
      level: "medium",
      answered,
      total,
      note: `${total - answered} answers were “not sure”, so we used typical figures for your scoring level. Tracking a round or two would sharpen this.`,
    };
  }
  return {
    level: "low",
    answered,
    total,
    note: `Most round stats were “not sure”, so this leans on typical figures for someone who shoots around ${typical}. Track penalties, greens and putts in your next round, then retake for a sharper plan.`,
  };
}

export function generatePlan(answers: AssessmentAnswers): ImprovementPlan {
  const typical = typicalScore(answers);
  const target = targetFor(typical);
  const current = benchmarkFor(typical);
  const goalLevel = benchmarkFor(target.score);
  const stats = golferStats(answers, current);

  const estimates = estimateAreas(answers, stats, goalLevel);
  const priorityArea = choosePriority(estimates, answers.perceivedWeakness);
  const priority = estimates.find((e) => e.area === priorityArea)!;
  const sorted = [...estimates].sort(
    (a, b) => b.strokes - a.strokes || AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area),
  );

  const content = AREA_CONTENT[priorityArea];
  const variant = variantFor(priorityArea, answers, stats, goalLevel);
  const drills = selectDrills(priorityArea, variant, answers.venues, answers.weeklyPractice === "30" ? 2 : 3);
  const sessions = buildSessions(drills, answers.weeklyPractice);

  const reasons = reasonsFor(priorityArea, answers, stats, goalLevel, target.phrase, typical);
  const runnerUp = sorted.find((a) => a.area !== priorityArea);
  if (runnerUp && priority.strokes > 0) {
    reasons.push(
      `At about ${count(priority.strokes)} strokes a round, it's the biggest of the five areas we estimated. Next is ${runnerUp.label.toLowerCase()}, at about ${count(runnerUp.strokes)}.`,
    );
  }

  const roundsToTrack = answers.roundsPerMonth === "rarely" ? 2 : 4;
  const weeks = Math.ceil(roundsToTrack / ROUNDS_PER_WEEK[answers.roundsPerMonth]);
  const goal = goalFor(priorityArea, variant, stats, goalLevel);
  const { sessions: sessionsPerWeek, minutes } = SCHEDULE[answers.weeklyPractice];

  return {
    generatedBy: "rules-v1",
    golfer: { typicalScore: typical, fromHandicap: answers.score.kind === "handicap" },
    target: { score: target.score, label: target.label },
    priority: {
      area: priorityArea,
      label: content.label,
      headline: content.headline,
      strokes: priority.strokes,
      reasons,
      explanation: content.explanation,
      courseTip: content.courseTip,
    },
    insight: insightFor(priority, estimates, answers.perceivedWeakness),
    goal: {
      ...goal,
      timeframe: `Over your next ${roundsToTrack} rounds — about ${weeks} ${weeks === 1 ? "week" : "weeks"} at your pace.`,
    },
    schedule: {
      sessionsPerWeek,
      minutesPerSession: minutes,
      sessions,
      phases: [
        { weeks: "Weeks 1–2", title: "Learn the feel", detail: "Do each drill slowly without worrying about the score. Good reps beat perfect ones." },
        { weeks: "Week 3", title: "Add pressure", detail: "Score every drill and write it down. Try to beat your last session." },
        { weeks: "Week 4", title: "Test it on the course", detail: `Play a round and track your ${content.metric}. Then retake the assessment.` },
      ],
    },
    drills: drills.map(({ id, name, venue, summary, steps, success }) => ({ id, name, venue, summary, steps, success })),
    areas: sorted,
    confidence: confidenceFor(answers, typical),
    checkIn: `Retake the assessment after your next ${roundsToTrack} rounds to see whether your priority has shifted.`,
  };
}
