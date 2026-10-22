import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { generatePlan } from "@/lib/assessment/engine";
import type { AssessmentAnswers } from "@/lib/assessment/types";
import { FEEDBACK_FORM_URL } from "@/lib/feedback";
import { PlanDashboard } from "./plan-dashboard";

const answers: AssessmentAnswers = {
  score: { kind: "score", value: 95 },
  roundsPerMonth: "1-2",
  perceivedWeakness: "unsure",
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

const render = (a: AssessmentAnswers) =>
  renderToStaticMarkup(<PlanDashboard plan={generatePlan(a)} venues={a.venues} completedAt={null} />);

/** Every <a> tag pointing at the feedback form. */
const feedbackAnchors = (html: string) => html.match(/<a [^>]*href="https:\/\/docs\.google\.com\/forms[^"]*"[^>]*>/g) ?? [];

describe("feedback link", () => {
  it("points at the form with no answers or other data attached", () => {
    expect(FEEDBACK_FORM_URL).toMatch(/^https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/viewform$/);
  });

  for (const [page, html] of [
    ["results page", () => render(answers)],
    ["homepage footer", () => renderToStaticMarkup(<Home />)],
  ] as const) {
    it(`appears on the ${page}, opening safely in a new tab`, () => {
      const markup = html();
      const anchors = feedbackAnchors(markup);
      expect(anchors).toHaveLength(1);
      expect(anchors[0]).toContain(`href="${FEEDBACK_FORM_URL}"`);
      expect(anchors[0]).toContain('target="_blank"');
      expect(anchors[0]).toContain('rel="noopener noreferrer"');
      expect(markup).toMatch(/optional/);
      expect(markup).toMatch(/Google Forms/);
    });
  }
});

describe("results page priority", () => {
  it("shows a clear result as the #1 priority with its strokes figure", () => {
    const html = render(answers);
    expect(html).toContain("Your #1 priority");
    expect(html).toContain("Why this is your priority");
    expect(html).not.toContain("No single area stands out");
  });

  it("presents an unclear result as a starting point, not a #1 priority", () => {
    const html = render({ ...answers, score: { kind: "score", value: 100 }, chipProximity: "sometimes" });
    expect(html).toContain("Suggested starting point");
    expect(html).toContain("No single area stands out");
    expect(html).toContain("Why the plan starts here");
    expect(html).not.toContain("Your #1 priority");
    expect(html).not.toContain("Why this is your priority");
    expect(html).toMatch(/>Low<\/dd>/);
  });
});
