import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Play, Radar, RefreshCw } from "lucide-react";
import { Panel } from "@/components/app/MetricCard";
import { NetworkGraph } from "@/components/app/NetworkGraph";
import { Shell } from "@/components/app/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "Network Simulation Center · Smart Network Traffic Predictor" },
      {
        name: "description",
        content: "Simulate college, ISP, enterprise and data-center networks to project growth, congestion zones and bandwidth needs.",
      },
      { property: "og:title", content: "Network Simulation Center" },
      { property: "og:description", content: "Project traffic growth and congestion zones under load scenarios." },
    ],
  }),
  component: SimulationPage,
});

const PROFILES: Record<string, { label: string; perUser: number; burst: number }> = {
  college: { label: "College Network", perUser: 1.8, burst: 1.5 },
  isp: { label: "ISP Network", perUser: 4.2, burst: 1.9 },
  enterprise: { label: "Enterprise Network", perUser: 3.1, burst: 1.35 },
  datacenter: { label: "Data Center", perUser: 12.5, burst: 2.4 },
};

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
  fontSize: 12,
};

function SimulationPage() {
  const [users, setUsers] = useState(1200);
  const [bandwidth, setBandwidth] = useState(1500);
  const [hours, setHours] = useState(12);
  const [profile, setProfile] = useState("college");
  const [running, setRunning] = useState(false);
  const [seed, setSeed] = useState(1);

  const cfg = PROFILES[profile]!;

  const series = useMemo(() => {
    return Array.from({ length: hours }, (_, i) => {
      const shape = Math.sin((i / hours) * Math.PI) ** 1.4;
      const jitter = (((i * 37 + seed * 11) % 13) - 6) / 100;
      const demand = users * cfg.perUser * (0.35 + shape * cfg.burst) * (1 + jitter);
      return {
        hour: `T+${i}h`,
        demand: Math.round(demand),
        capacity: bandwidth,
        growth: Math.round(demand * 1.22),
      };
    });
  }, [users, bandwidth, hours, cfg, seed]);

  const peak = Math.max(...series.map((s) => s.demand));
  const congested = series.filter((s) => s.demand > bandwidth).length;
  const required = Math.round(peak * 1.25);

  return (
    <Shell title="Network Simulation Center" subtitle="Model load scenarios and project bandwidth requirements">
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Panel title="Simulation Inputs">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="users">Total Users</Label>
              <Input
                id="users"
                type="number"
                value={users}
                onChange={(e) => setUsers(Number(e.target.value))}
                className="bg-surface-2/60 font-mono"
              />
              <Slider value={[users]} min={50} max={20000} step={50} onValueChange={(v) => setUsers(v[0] ?? users)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bw">Bandwidth (Mbps)</Label>
              <Input
                id="bw"
                type="number"
                value={bandwidth}
                onChange={(e) => setBandwidth(Number(e.target.value))}
                className="bg-surface-2/60 font-mono"
              />
              <Slider
                value={[bandwidth]}
                min={100}
                max={40000}
                step={100}
                onValueChange={(v) => setBandwidth(v[0] ?? bandwidth)}
              />
            </div>
            <div className="space-y-2">
              <Label>Time Range — {hours} hours</Label>
              <Slider value={[hours]} min={4} max={48} step={1} onValueChange={(v) => setHours(v[0] ?? hours)} />
            </div>
            <div className="space-y-2">
              <Label>Simulation Type</Label>
              <Select value={profile} onValueChange={setProfile}>
                <SelectTrigger className="bg-surface-2/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROFILES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  setRunning(true);
                  setSeed((s) => s + 1);
                  setTimeout(() => setRunning(false), 1200);
                }}
              >
                {running ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Play className="mr-2 size-4" />}
                {running ? "Simulating…" : "Run Simulation"}
              </Button>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { k: "Predicted Growth", v: "+22.0%", tone: "text-success" },
              { k: "Congestion Zones", v: `${congested} windows`, tone: congested ? "text-danger" : "text-success" },
              { k: "Bandwidth Required", v: `${required.toLocaleString()} Mbps`, tone: "text-primary" },
            ].map((c, i) => (
              <motion.div
                key={c.k}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-2xl p-5"
              >
                <p className="text-muted-foreground text-xs tracking-[0.16em] uppercase">{c.k}</p>
                <p className={cn("font-display mt-2 text-2xl font-semibold", c.tone)}>{c.v}</p>
              </motion.div>
            ))}
          </div>

          <Panel title="Traffic Simulation" action={<Radar className={cn("size-4 text-primary", running && "animate-spin")} />}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="simFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--grid)" strokeDasharray="3 6" />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="growth" stroke="var(--chart-4)" fill="url(#growthFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="demand" stroke="var(--chart-1)" fill="url(#simFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="capacity" stroke="var(--danger)" fill="transparent" strokeDasharray="6 6" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Live Simulated Fabric">
            <NetworkGraph />
          </Panel>
        </div>
      </div>
    </Shell>
  );
}
