import type { Metadata } from "next";
import { PlanView } from "@/components/plan-view";

export const metadata: Metadata = {
  title: "Your plan — GolfIQ",
};

export default function PlanPage() {
  return <PlanView />;
}
