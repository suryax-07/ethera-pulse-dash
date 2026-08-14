import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/Shell";
import { InterpolationView } from "@/components/app/InterpolationView";

export const Route = createFileRoute("/newton-forward")({
  head: () => ({
    meta: [
      { title: "Newton Forward · Smart Network Traffic Predictor" },
      {
        name: "description",
        content: "Forward difference table, step-by-step Newton forward interpolation and traffic prediction graphs.",
      },
      { property: "og:title", content: "Newton Forward Interpolation Console" },
      { property: "og:description", content: "Forward difference tables and live traffic prediction." },
    ],
  }),
  component: () => (
    <Shell title="Newton Forward Interpolation" subtitle="Equally spaced samples · leading difference model">
      <InterpolationView mode="forward" />
    </Shell>
  ),
});
