import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, Flame, Gauge, TrendingUp } from "lucide-react";
import { MetricCard, Panel } from "@/components/app/MetricCard";
import { Shell } from "@/components/app/Shell";
import { heatmap, hourlyTraffic, weekdays } from "@/lib/network";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/peak-analysis")({
  head: () => ({
    meta: [
      { title: "Peak Traffic Analysis · Smart Network Traffic Predictor" },
      {
        name: "description",
        content: "Peak hours, congestion windows, weekly heatmaps and usage timelines for the campus backbone.",
      },
      { property: "og:title", content: "Peak Traffic Analysis" },
      { property: "og:description", content: "Heatmaps, congestion windows and peak usage timelines." },
    ],
  }),
  component: PeakPage,
});

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
  fontSize: 12,
};

function loadColor(v: number) {
  if (v < 45) return "var(--success)";
  if (v < 75) return "var(--warning)";
  return "var(--danger)";
}

function PeakPage() {
  const peak = hourlyTraffic.reduce((a, b) => (b.traffic > a.traffic ? b : a));
  const avg = hourlyTraffic.reduce((s, p) => s + p.traffic, 0) / hourlyTraffic.length;

  return (
    <Shell title="Peak Traffic Analysis" subtitle="Congestion windows, load distribution and weekly heatmap">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Peak Hour" value={12} unit=":00" icon={Flame} tone="danger" delta={`${peak.traffic} Mbps`} index={0} />
        <MetricCard label="Congestion Hours" value={5} unit="h/day" icon={Clock} tone="warning" delta="10:00 – 15:00" index={1} />
        <MetricCard label="Average Usage" value={avg} decimals={1} unit="Mbps" icon={Gauge} index={2} />
        <MetricCard label="Maximum Load" value={97.3} decimals={1} unit="%" icon={TrendingUp} tone="danger" index={3} />
      </div>

      <Panel title="Peak Usage Timeline" className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyTraffic}>
            <CartesianGrid stroke="var(--grid)" strokeDasharray="3 6" />
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--surface-2)", opacity: 0.4 }} />
            <Bar dataKey="traffic" radius={[6, 6, 0, 0]}>
              {hourlyTraffic.map((p) => (
                <Cell key={p.hour} fill={loadColor((p.traffic / 910) * 100)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Weekly Traffic Calendar Heatmap">
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            <div className="mb-2 grid grid-cols-[52px_repeat(24,minmax(0,1fr))] gap-1">
              <span />
              {Array.from({ length: 24 }, (_, h) => (
                <span key={h} className="text-muted-foreground text-center text-[10px]">
                  {h}
                </span>
              ))}
            </div>
            {heatmap.map((row, d) => (
              <div key={weekdays[d]} className="mb-1 grid grid-cols-[52px_repeat(24,minmax(0,1fr))] items-center gap-1">
                <span className="text-muted-foreground text-xs">{weekdays[d]}</span>
                {row.map((v, h) => (
                  <div
                    key={h}
                    title={`${weekdays[d]} ${h}:00 — ${v}% load`}
                    className="h-6 rounded transition-transform hover:scale-125"
                    style={{ background: loadColor(v), opacity: 0.25 + v / 140 }}
                  />
                ))}
              </div>
            ))}
            <div className="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
              {[
                ["Healthy < 45%", "var(--success)"],
                ["Elevated 45–75%", "var(--warning)"],
                ["Congested > 75%", "var(--danger)"],
              ].map(([label, color]) => (
                <span key={label} className="flex items-center gap-2">
                  <span className="size-3 rounded" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { t: "Morning ramp", d: "07:00 – 09:30", s: "Healthy", tone: "success" },
          { t: "Midday peak", d: "11:00 – 13:30", s: "Congested", tone: "danger" },
          { t: "Evening surge", d: "18:00 – 20:00", s: "Elevated", tone: "warning" },
        ].map((w) => (
          <div key={w.t} className="glass rounded-2xl p-5">
            <p className="text-muted-foreground text-xs tracking-[0.16em] uppercase">{w.t}</p>
            <p className="font-display mt-2 text-xl">{w.d}</p>
            <p
              className={cn(
                "mt-1 text-sm",
                w.tone === "success" && "text-success",
                w.tone === "warning" && "text-warning",
                w.tone === "danger" && "text-danger",
              )}
            >
              {w.s}
            </p>
          </div>
        ))}
      </div>
    </Shell>
  );
}
