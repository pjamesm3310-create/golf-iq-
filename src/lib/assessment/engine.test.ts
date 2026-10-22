import { describe, expect, it } from "vitest";
import { CLEAR_PRIORITY_MIN, generatePlan, selectDrills, targetFor, typicalScore } from "./engine";
import { QUESTIONS } from "./questions";
import { rulesProvider } from "./provider";
import type { AssessmentAnswers } from "./types";

const base: AssessmentAnswers = {
  score: { kind: "score", value: 95 },
  roundsPerMonth: "3-4",
  perceivedWeakness: "unsure",
  teeInPlay: "half",
  penalties: "2-3",
  greens: "3-5",
  approachMiss: "short",
  chipProximity: "sometimes",
  putts: "34-37",
  threePutts: "2-3",
  blowUps: "3-5",
  weeklyPractice: "60",
  venues: ["range", "shortGame", "puttingGreen", "home"],
};

const make = (overrides: Partial<AssessmentAnswers>): AssessmentAnswers => ({ ...base, ...overrides });

describe("targets", () => {
  it("sets the next scoring milestone", () => {
    expect(targetFor(95)).toMatchObject({ score: 89, label: "Break 90" });
    expect(targetFor(103)).toMatchObject({ score: 99, label: "Break 100" });
    expect(targetFor(80)).toMatchObject({ score: 79, label: "Break 80" });
    expect(targetFor(76)).toMatchObject({ score: 73, label: "Shoot 73" });
    expect(targetFor(64)).toMatchObject({ score: 66 - 0, label: "Shoot 66" });
  });

  it("converts a handicap index to a typical score", () => {
    expect(typicalScore(make({ score: { kind: "handicap", value: 18 } }))).toBe(93);
    expect(typicalScore(make({ score: { kind: "handicap", value: -2 } }))).toBe(73);
  });
});

describe("priority", () => {
  it("finds the short game when chips rarely finish close", () => {
    const plan = generatePlan(make({ chipProximity: "rarely" }));
    expect(plan.priority.area).toBe("shortGame");
    expect(plan.priority.strokes).toBeGreaterThan(2);
    expect(plan.areas[0].area).toBe("shortGame");
  });

  it("finds tee shots when penalties pile up, and sets a penalty goal", () => {
    const plan = generatePlan(make({ teeInPlay: "few", penalties: "4+" }));
    expect(plan.priority.area).toBe("driving");
    expect(plan.goal.statement).toMatch(/penalty strokes/);
  });

  it("finds putting and trains speed when three-putts are frequent", () => {
    const plan = generatePlan(
      make({ putts: "38+", threePutts: "4+", chipProximity: "usually", penalties: "0-1", teeInPlay: "most" }),
    );
    expect(plan.priority.area).toBe("putting");
    expect(plan.drills.map((d) => d.id)).toContain("ladder-lag");
    expect(plan.goal.statement).toBe("No more than 1 three-putt per round");
  });

  it("trains short putts when three-putts are already rare", () => {
    const plan = generatePlan(
      make({ putts: "38+", threePutts: "0-1", chipProximity: "usually", penalties: "0-1", teeInPlay: "most" }),
    );
    expect(plan.priority.area).toBe("putting");
    expect(plan.drills.map((d) => d.id)).toContain("circle-of-eight");
  });

  it("finds decision-making when blow-up holes dominate", () => {
    const plan = generatePlan(
      make({ blowUps: "6+", chipProximity: "usually", putts: "30-33", greens: "6-9", teeInPlay: "most", penalties: "2-3" }),
    );
    expect(plan.priority.area).toBe("strategy");
    expect(plan.drills.filter((d) => d.venue === "course").length).toBeLessThanOrEqual(1);
  });

  it("finds approach play and starts with contact when greens are rare and strikes are poor", () => {
    const plan = generatePlan(
      make({ score: { kind: "score", value: 84 }, greens: "0-2", approachMiss: "contact", chipProximity: "usually", putts: "30-33", threePutts: "0-1", blowUps: "0-2", penalties: "0-1", teeInPlay: "most" }),
    );
    expect(plan.priority.area).toBe("approach");
    expect(plan.drills[0].id).toBe("low-point-line");
  });

  it("lets the golfer's own read break a near-tie, but not override a clear gap", () => {
    const neutral = generatePlan(base);
    const [first, second] = neutral.areas;
    expect(first.strokes - second.strokes).toBeLessThan(0.5);
    expect(generatePlan(make({ perceivedWeakness: second.area })).priority.area).toBe(second.area);

    const clear = generatePlan(make({ chipProximity: "rarely", perceivedWeakness: "putting" }));
    expect(clear.priority.area).toBe("shortGame");
    expect(clear.insight.kind).toBe("mismatch");
    expect(clear.insight.text).toMatch(/You said putting feels weakest/);
  });

  it("confirms the golfer's read when it matches", () => {
    const plan = generatePlan(make({ chipProximity: "rarely", perceivedWeakness: "shortGame" }));
    expect(plan.insight.kind).toBe("match");
  });
});

describe("plan shape", () => {
  it("fits drills to where the golfer can practise", () => {
    const plan = generatePlan(make({ chipProximity: "rarely", venues: ["home"] }));
    expect(plan.drills[0].venue).toBe("home");
  });

  it("gives two drills and two 15-minute sessions for 30 minutes a week", () => {
    const plan = generatePlan(make({ weeklyPractice: "30" }));
    expect(plan.drills).toHaveLength(2);
    expect(plan.schedule.sessions).toHaveLength(2);
    for (const s of plan.schedule.sessions) {
      expect(s.minutes).toBe(15);
      expect(s.blocks.reduce((sum, b) => sum + b.minutes, 0)).toBe(15);
    }
  });

  it("keeps on-course drills out of practice sessions", () => {
    const drills = selectDrills("strategy", null, ["puttingGreen"], 3);
    expect(drills.every((d) => d.venue === "course" || d.venue !== "puttingGreen")).toBe(true);
    const plan = generatePlan(make({ blowUps: "6+", chipProximity: "usually", putts: "30-33", greens: "6-9", teeInPlay: "most", venues: ["range"] }));
    const ids = new Set(plan.drills.filter((d) => d.venue !== "course").map((d) => d.id));
    for (const s of plan.schedule.sessions) for (const b of s.blocks) expect(ids.has(b.drillId)).toBe(true);
  });

  it("reports low confidence and assumptions when most answers are unsure", () => {
    const plan = generatePlan(
      make({ teeInPlay: "unsure", penalties: "unsure", greens: "unsure", approachMiss: "unsure", chipProximity: "unsure", putts: "unsure", threePutts: "unsure", blowUps: "unsure" }),
    );
    expect(plan.confidence).toMatchObject({ level: "low", answered: 0, total: 8 });
    expect(plan.areas.every((a) => a.assumed)).toBe(true);
    expect(plan.priority.reasons.some((r) => r.includes("weren't sure"))).toBe(true);
  });

  it("is deterministic", () => {
    expect(generatePlan(base)).toEqual(generatePlan(base));
  });

  it("is what the rules provider returns", async () => {
    await expect(rulesProvider.createPlan(base)).resolves.toEqual(generatePlan(base));
  });
});

describe("every combination stays well-formed", () => {
  // Walk a deterministic sample of the answer space and check invariants on each plan.
  const choice = (key: keyof AssessmentAnswers) => {
    const q = QUESTIONS.find((x) => x.key === key)!;
    return q.kind === "score" ? [] : q.options.map((o) => o.value);
  };
  const scores = [62, 74, 79, 85, 90, 99, 108, 125, 160];
  const venueSets: AssessmentAnswers["venues"][] = [["home"], ["range"], ["puttingGreen"], ["shortGame", "home"], ["range", "shortGame", "puttingGreen", "home"]];

  let seed = 7;
  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % n;
  };
  const any = <T,>(list: readonly T[]) => list[rand(list.length)];

  it("produces a complete, sensible plan for 2,000 sampled golfers", () => {
    for (let i = 0; i < 2000; i++) {
      const answers = {
        score: { kind: "score", value: any(scores) },
        roundsPerMonth: any(choice("roundsPerMonth")),
        perceivedWeakness: any(choice("perceivedWeakness")),
        teeInPlay: any(choice("teeInPlay")),
        penalties: any(choice("penalties")),
        greens: any(choice("greens")),
        approachMiss: any(choice("approachMiss")),
        chipProximity: any(choice("chipProximity")),
        putts: any(choice("putts")),
        threePutts: any(choice("threePutts")),
        blowUps: any(choice("blowUps")),
        weeklyPractice: any(choice("weeklyPractice")),
        venues: any(venueSets),
      } as AssessmentAnswers;
      const plan = generatePlan(answers);

      expect(plan.drills.length).toBeGreaterThanOrEqual(2);
      expect(plan.drills.length).toBeLessThanOrEqual(3);
      expect(new Set(plan.drills.map((d) => d.id)).size).toBe(plan.drills.length);
      expect(plan.areas).toHaveLength(5);
      expect(plan.areas.every((a) => a.strokes >= 0)).toBe(true);
      expect(plan.priority.reasons.length).toBeGreaterThan(0);
      for (const s of plan.schedule.sessions) {
        expect(s.blocks.reduce((sum, b) => sum + b.minutes, 0)).toBe(s.minutes);
        expect(s.blocks.every((b) => b.minutes > 0)).toBe(true);
      }
      const text = JSON.stringify(plan);
      expect(text).not.toMatch(/undefined|NaN|Infinity/);

      // Regression invariants: honest priority, achievable goals, consistent timeframe.
      const top = plan.areas[0].strokes;
      const others = plan.areas.filter((a) => a.area !== plan.priority.area);
      expect(plan.priority.clear).toBe(top >= CLEAR_PRIORITY_MIN);
      if (!plan.priority.clear) {
        expect(plan.confidence.level).toBe("low");
        expect(plan.priority.reasons[0]).toMatch(/no single area stands out/);
        expect(["match", "mismatch"]).not.toContain(plan.insight.kind);
      }
      if (plan.priority.reasons.some((r) => r.includes("it's the biggest"))) {
        expect(others.every((a) => plan.priority.strokes > a.strokes)).toBe(true);
      }
      if (plan.insight.text.startsWith("You called it")) {
        expect(plan.priority.strokes).toBe(top);
      }
      expect(plan.goal.statement).not.toMatch(/\b0 three-putt/);
      expect(plan.goal.statement).not.toMatch(/\b1 three-putts\b/);
      expect(plan.goal.timeframe).toMatch(/four-week plan/);
      expect(plan.goal.timeframe).not.toMatch(/\d+ weeks?/);
      expect(plan.checkIn).toMatch(/four-week plan/);
    }
  });
});

describe("no clear priority", () => {
  // Shoots 100 with answers at or better than golfers who break 100 in every area.
  const level = make({ score: { kind: "score", value: 100 } });

  it("does not present list order as a definitive #1 priority", () => {
    const plan = generatePlan(level);
    expect(plan.areas.every((a) => a.strokes === 0)).toBe(true);
    expect(plan.priority.clear).toBe(false);
    expect(plan.confidence.level).toBe("low");
    expect(plan.priority.reasons[0]).toMatch(/no single area stands out/);
    expect(plan.priority.reasons.join(" ")).not.toMatch(/biggest/);
    expect(plan.insight.text).toMatch(/didn't separate the five areas/);
    expect(plan.insight.text).toMatch(/general first step/);
  });

  it("starts with the golfer's own pick when they gave one", () => {
    const plan = generatePlan({ ...level, perceivedWeakness: "putting" });
    expect(plan.priority.clear).toBe(false);
    expect(plan.priority.area).toBe("putting");
    expect(plan.insight.kind).toBe("none");
    expect(plan.insight.text).toMatch(/You told us putting feels weakest/);
  });

  it("uses the largest of several small estimates, and says so", () => {
    // Good everywhere, unsure only about tee shots: the assumed figure gives a small estimate.
    const plan = generatePlan(
      make({ teeInPlay: "unsure", penalties: "0-1", greens: "6-9", chipProximity: "usually", putts: "30-33", threePutts: "0-1", blowUps: "0-2" }),
    );
    expect(plan.priority.clear).toBe(false);
    expect(plan.priority.area).toBe("driving");
    expect(plan.priority.strokes).toBeGreaterThan(0);
    expect(plan.priority.strokes).toBeLessThan(CLEAR_PRIORITY_MIN);
    expect(plan.insight.text).toMatch(/largest of several small estimates/);
  });

  it("leaves a clear result alone", () => {
    const plan = generatePlan(make({ chipProximity: "rarely" }));
    expect(plan.priority.clear).toBe(true);
    expect(plan.confidence.level).toBe("high");
    expect(plan.priority.reasons.some((r) => r.includes("it's the biggest"))).toBe(true);
  });
});

describe("honest ranking wording", () => {
  it("doesn't call the golfer's pick the biggest when it won a near-tie", () => {
    const [first, second] = generatePlan(base).areas;
    expect(second.strokes).toBeLessThan(first.strokes);
    const plan = generatePlan(make({ perceivedWeakness: second.area }));
    expect(plan.priority.area).toBe(second.area);
    expect(plan.priority.reasons.join(" ")).not.toMatch(/biggest/);
    expect(plan.priority.reasons.at(-1)).toMatch(/^It's close/);
    expect(plan.insight.kind).toBe("none");
    expect(plan.insight.text).not.toMatch(/You called it/);
  });

  it("calls an exact tie a tie", () => {
    // Search a fixed slice of the answer space for a clear result with a tie at the top.
    const values = (key: keyof AssessmentAnswers) => {
      const q = QUESTIONS.find((x) => x.key === key)!;
      return q.kind === "score" ? [] : q.options.map((o) => o.value);
    };
    let tied: ReturnType<typeof generatePlan> | undefined;
    search: for (const score of [85, 95, 105])
      for (const teeInPlay of values("teeInPlay"))
        for (const greens of values("greens"))
          for (const putts of values("putts"))
            for (const blowUps of values("blowUps")) {
              const plan = generatePlan(make({ score: { kind: "score", value: score }, teeInPlay, greens, putts, blowUps } as Partial<AssessmentAnswers>));
              if (plan.priority.clear && plan.areas[0].strokes === plan.areas[1].strokes) {
                tied = plan;
                break search;
              }
            }
    expect(tied).toBeDefined();
    expect(tied!.priority.reasons.join(" ")).not.toMatch(/biggest/);
    expect(tied!.priority.reasons.at(-1)).toMatch(/^It's level with/);
  });
});

describe("goals", () => {
  const threePutter = { putts: "38+", threePutts: "4+", chipProximity: "usually", penalties: "0-1", teeInPlay: "most", greens: "6-9", blowUps: "0-2" } as const;

  it("never asks for zero three-putts", () => {
    // Golfers who break 80 average about one three-putt; rounding that down used to give 0.
    const plan = generatePlan(make({ ...threePutter, score: { kind: "score", value: 85 } }));
    expect(plan.priority.area).toBe("putting");
    expect(plan.goal.statement).toBe("No more than 1 three-putt per round");
  });

  it("uses the plural above one", () => {
    const plan = generatePlan(make({ ...threePutter, score: { kind: "score", value: 105 } }));
    expect(plan.priority.area).toBe("putting");
    expect(plan.goal.statement).toBe("No more than 2 three-putts per round");
  });

  it("keeps the timeframe within the four-week plan for every play frequency", () => {
    const phrases = { rarely: "maybe one round", "1-2": "one or two rounds", "3-4": "about four rounds", "5+": "five or more rounds" } as const;
    for (const [roundsPerMonth, phrase] of Object.entries(phrases)) {
      const plan = generatePlan(make({ roundsPerMonth: roundsPerMonth as AssessmentAnswers["roundsPerMonth"] }));
      expect(plan.goal.timeframe).toBe(`Work toward it during the four-week plan, and check it in the rounds you play — ${phrase} at your pace.`);
    }
  });
});
