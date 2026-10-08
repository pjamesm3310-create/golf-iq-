import { generatePlan } from "./engine";
import type { AssessmentAnswers, ImprovementPlan } from "./types";

// The single seam between the UI and whatever produces a plan. Today it is the
// local rule-based engine; an AI-backed provider can implement the same interface
// later (for example via a server route) without the UI changing.

export interface PlanProvider {
  readonly id: ImprovementPlan["generatedBy"];
  createPlan(answers: AssessmentAnswers): Promise<ImprovementPlan>;
}

export const rulesProvider: PlanProvider = {
  id: "rules-v1",
  async createPlan(answers) {
    return generatePlan(answers);
  },
};

export function getPlanProvider(): PlanProvider {
  return rulesProvider;
}
