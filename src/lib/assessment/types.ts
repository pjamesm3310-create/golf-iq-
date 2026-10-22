// Shared types for the assessment and the plan it produces.
// The plan shape is the contract any plan provider (rules today, AI later) must return.

export type AreaId = "driving" | "approach" | "shortGame" | "putting" | "strategy";

export type ScoreInput =
  | { kind: "score"; value: number }
  | { kind: "handicap"; value: number };

export type RoundsPerMonth = "rarely" | "1-2" | "3-4" | "5+";
export type PerceivedWeakness = AreaId | "unsure";
export type TeeInPlay = "most" | "half" | "few" | "unsure";
export type Penalties = "0-1" | "2-3" | "4+" | "unsure";
export type Greens = "0-2" | "3-5" | "6-9" | "10+" | "unsure";
export type ApproachMiss = "short" | "long" | "sideways" | "contact" | "unsure";
export type ChipProximity = "usually" | "sometimes" | "rarely" | "unsure";
export type Putts = "under30" | "30-33" | "34-37" | "38+" | "unsure";
export type ThreePutts = "0-1" | "2-3" | "4+" | "unsure";
export type BlowUps = "0-2" | "3-5" | "6+" | "unsure";
export type WeeklyPractice = "30" | "60" | "120" | "180";
export type Venue = "range" | "shortGame" | "puttingGreen" | "home";

export interface AssessmentAnswers {
  score: ScoreInput;
  roundsPerMonth: RoundsPerMonth;
  perceivedWeakness: PerceivedWeakness;
  teeInPlay: TeeInPlay;
  penalties: Penalties;
  greens: Greens;
  approachMiss: ApproachMiss;
  chipProximity: ChipProximity;
  putts: Putts;
  threePutts: ThreePutts;
  blowUps: BlowUps;
  weeklyPractice: WeeklyPractice;
  venues: Venue[];
}

/** Where a drill happens. "course" drills are done during a normal round. */
export type DrillVenue = Venue | "course";

export interface Drill {
  id: string;
  name: string;
  venue: DrillVenue;
  summary: string;
  steps: string[];
  success: string;
}

export interface AreaEstimate {
  area: AreaId;
  label: string;
  /** Estimated strokes per round lost versus golfers at the target level. */
  strokes: number;
  /** True when at least one input for this area was "not sure" and a typical value was assumed. */
  assumed: boolean;
}

export interface PlanSession {
  name: string;
  minutes: number;
  blocks: { drillId: string; minutes: number }[];
}

export interface ImprovementPlan {
  /** Which provider produced the plan, so the UI can describe it honestly. */
  generatedBy: "rules-v1";
  golfer: {
    typicalScore: number;
    fromHandicap: boolean;
  };
  target: { score: number; label: string };
  priority: {
    area: AreaId;
    label: string;
    headline: string;
    strokes: number;
    /**
     * False when no area meaningfully stands out. The plan still has a focus,
     * but it is a starting point, not a diagnosis.
     */
    clear: boolean;
    reasons: string[];
    explanation: string;
    courseTip: string;
  };
  /** How the result compares with the area the golfer said felt weakest. */
  insight: { kind: "match" | "mismatch" | "none"; text: string };
  goal: { statement: string; measure: string; timeframe: string };
  schedule: {
    sessionsPerWeek: number;
    minutesPerSession: number;
    sessions: PlanSession[];
    phases: { weeks: string; title: string; detail: string }[];
  };
  drills: Drill[];
  areas: AreaEstimate[];
  confidence: { level: "high" | "medium" | "low"; answered: number; total: number; note: string };
  checkIn: string;
}
