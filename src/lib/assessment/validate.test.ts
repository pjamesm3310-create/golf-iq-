import { describe, expect, it } from "vitest";
import { parseAnswers, parseScoreEntry } from "./validate";
import { unwrapSaved } from "../storage";

const valid = {
  score: { kind: "score", value: 95 },
  roundsPerMonth: "1-2",
  perceivedWeakness: "putting",
  teeInPlay: "half",
  penalties: "2-3",
  greens: "3-5",
  approachMiss: "short",
  chipProximity: "rarely",
  putts: "34-37",
  threePutts: "2-3",
  blowUps: "3-5",
  weeklyPractice: "60",
  venues: ["range", "home"],
};

describe("parseScoreEntry", () => {
  it("accepts typical scores and rejects nonsense", () => {
    expect(parseScoreEntry("score", " 92 ")).toEqual({ ok: true, value: { kind: "score", value: 92 } });
    expect(parseScoreEntry("score", "").ok).toBe(false);
    expect(parseScoreEntry("score", "abc").ok).toBe(false);
    expect(parseScoreEntry("score", "92.5").ok).toBe(false);
    expect(parseScoreEntry("score", "40").ok).toBe(false);
    expect(parseScoreEntry("score", "200").ok).toBe(false);
    expect(parseScoreEntry("score", "-90").ok).toBe(false);
  });

  it("accepts handicaps, including plus handicaps", () => {
    expect(parseScoreEntry("handicap", "12.4")).toEqual({ ok: true, value: { kind: "handicap", value: 12.4 } });
    expect(parseScoreEntry("handicap", "+2")).toEqual({ ok: true, value: { kind: "handicap", value: -2 } });
    expect(parseScoreEntry("handicap", "55").ok).toBe(false);
    expect(parseScoreEntry("handicap", "+11").ok).toBe(false);
    expect(parseScoreEntry("handicap", "12.45").ok).toBe(false);
  });
});

describe("parseAnswers", () => {
  it("accepts a complete set and drops unknown keys", () => {
    const result = parseAnswers({ ...valid, injected: "<script>" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.answers).not.toHaveProperty("injected");
  });

  it("rejects non-objects", () => {
    for (const input of [null, undefined, 3, "x", []]) expect(parseAnswers(input).ok).toBe(false);
  });

  it("names every invalid or missing field", () => {
    const result = parseAnswers({ ...valid, putts: "lots", venues: [], greens: undefined });
    expect(result).toEqual({ ok: false, errors: ["greens", "putts", "venues"] });
  });

  it("rejects out-of-range or malformed scores", () => {
    expect(parseAnswers({ ...valid, score: { kind: "score", value: 30 } }).ok).toBe(false);
    expect(parseAnswers({ ...valid, score: { kind: "score", value: 90.5 } }).ok).toBe(false);
    expect(parseAnswers({ ...valid, score: { kind: "handicap", value: Number.NaN } }).ok).toBe(false);
    expect(parseAnswers({ ...valid, score: { kind: "other", value: 90 } }).ok).toBe(false);
  });

  it("rejects unknown or duplicate venues", () => {
    expect(parseAnswers({ ...valid, venues: ["range", "moon"] }).ok).toBe(false);
    expect(parseAnswers({ ...valid, venues: ["range", "range"] }).ok).toBe(false);
  });
});

describe("unwrapSaved", () => {
  it("handles corrupt saved data without throwing", () => {
    expect(unwrapSaved("{not json")).toBeNull();
    expect(unwrapSaved("42")).toBeNull();
    expect(unwrapSaved(JSON.stringify({ answers: valid, completedAt: "2026-10-07T00:00:00.000Z" }))).toEqual({
      answers: valid,
      completedAt: "2026-10-07T00:00:00.000Z",
    });
  });
});
