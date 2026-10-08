import type { Metadata } from "next";
import { AssessmentFlow } from "@/components/assessment-flow";

export const metadata: Metadata = {
  title: "Assessment — GolfIQ",
};

export default function AssessmentPage() {
  return <AssessmentFlow />;
}
