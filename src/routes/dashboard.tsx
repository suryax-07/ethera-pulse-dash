import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  Brain,
  Gauge,
  HeartPulse,
  Signal,
  TrendingUp,
  Waves,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricCard, Panel } from "@/components/app/MetricCard";
import { NetworkGraph } from "@/components/app/NetworkGraph";
import { Shell } from "@/components/app/Shell";
import { aiInsights, hourlyTraffic } from "@/lib/network";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard · Smart Network Traffic Predictor" },
      {
        name: "description",
        content: "Live bandwidth, predicted traffic, congestion risk and network topology telemetry in one NOC view.",
      },
      { property: "og:title", content: "Operations Dashboard · Smart Network Traffic Predictor" },
      { property: "og:description", content: "Live network telemetry, forecasts and congestion risk." },
    ],
  }),
  component: DashboardPage,
});

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
  fontSize: 12,
};

function DashboardPage() {
  return (
    <Shell title="Operations Dashboard" subtitle="Real-time telemetry across the campus backbone">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong neon-ring mb-6 flex flex-wrap items-center gap-6 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3">
          <span className="bg-success size-3 animate-pulse-dot rounded-full" />
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Network Status</p>
            <p className="font-display text-success text-2xl font-semibold">ONLINE</p>
          </div>
        </div>
        <div className="bg-border hidden h-10 w-px sm:block" />
        {[
          { k: "Nodes", v: "148 active" },
          { k: "Uptime", v: "99.982%" },
          { k: "Latency", v: "12 ms" },
          { k: "Packet loss", v: "0.04%" },
        ].map((s) => (
          <div key={s.k}>
            <p className="text-muted-foreground text-xs tracking-[0.16em] uppercase">{s.k}</p>
            <p className="font-display text-lg">{s.v}</p>
          </div>
        ))}
      </motion.div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Current Bandwidth" value={1284} unit="Mbps" icon={Signal} delta="+8.2% vs last hour" index={0} />
        <MetricCard label="Current Traffic" value={910} unit="Mbps" icon={Waves} tone="primary" delta="Peak window" index={1} />
        <MetricCard label="Predicted Traffic" value={1112} unit="Mbps" icon={TrendingUp} tone="success" delta="+22.4% projected" index={2} />
        <MetricCard label="Network Health" value={94.6} decimals={1} unit="%" icon={HeartPulse} tone="success" delta="All core links stable" index={3} />
        <MetricCard label="Peak Load" value={97.3} decimals={1} unit="%" icon={Gauge} tone="warning" delta="Reached at 12:15" index={4} />
        <MetricCard label="Congestion Risk" value={46} unit="%" icon={AlertTriangle} tone="danger" delta="Medium — AP-07, AP-12" index={5} />
      </div>

      <Panel
        title="Live Network Visualization"
        className="mb-6"
        action={
          <span className="text-muted-foreground flex items-center gap-2 text-xs">
            <Activity className="text-success size-4" /> packets streaming
          </span>
        }
      >
        <NetworkGraph />
      </Panel>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <Panel title="Traffic Trend (24h)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyTraffic}>
              <defs>
                <linearGradient id="fillTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 6" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="traffic"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#fillTraffic)"
              />
              <Brush dataKey="label" height={22} travellerWidth={8} stroke="var(--primary)" fill="var(--surface-2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Bandwidth vs Active Users">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hourlyTraffic}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 6" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="bandwidth" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="users" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              <Brush dataKey="label" height={22} travellerWidth={8} stroke="var(--primary)" fill="var(--surface-2)" />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="AI Analytics Panel" action={<Brain className="text-primary size-4" />}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {aiInsights.map((insight, i) => (
            <motion.article
              key={insight.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-surface-2/50 rounded-xl border p-4"
            >
              <span
                className={cn(
                  "inline-block rounded-full px-2 py-0.5 text-[10px] tracking-widest uppercase",
                  insight.level === "info" && "bg-primary/15 text-primary",
                  insight.level === "warn" && "bg-warning/15 text-warning",
                  insight.level === "danger" && "bg-danger/15 text-danger",
                )}
              >
                {insight.level === "danger" ? "risk" : insight.level === "warn" ? "advisory" : "forecast"}
              </span>
              <h3 className="mt-3 text-sm font-semibold">{insight.title}</h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{insight.detail}</p>
            </motion.article>
          ))}
        </div>
      </Panel>
    </Shell>
  );
}
