import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/Shell";
import { InterpolationView } from "@/components/app/InterpolationView";

export const Route = createFileRoute("/newton-backward")({
  head: () => ({
    meta: [
      { title: "Newton Backward · Smart Network Traffic Predictor" },
      {
        name: "description",
        content: "Backward difference table, calculation breakdown and visual graph for end-of-range traffic forecasts.",
      },
      { property: "og:title", content: "Newton Backward Interpolation Console" },
      { property: "og:description", content: "Backward difference tables and prediction results." },
    ],
  }),
  component: () => (
    <Shell title="Newton Backward Interpolation" subtitle="Equally spaced samples · trailing difference model">
      <InterpolationView mode="backward" />
    </Shell>
  ),
});
