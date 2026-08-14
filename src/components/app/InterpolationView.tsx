import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "@/components/app/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { equalSpacedDataset, interpolateCurve, newtonBackward, newtonForward } from "@/lib/network";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
  fontSize: 12,
};

export function InterpolationView({ mode }: { mode: "forward" | "backward" }) {
  const points = equalSpacedDataset;
  const [target, setTarget] = useState(mode === "forward" ? 9 : 17);
  const fn = mode === "forward" ? newtonForward : newtonBackward;
  const model = useMemo(() => fn(points, target), [fn, points, target]);
  const curve = useMemo(() => interpolateCurve(points, fn), [fn, points]);

  const symbol = mode === "forward" ? "Δ" : "∇";
  const formula =
    mode === "forward"
      ? "y(x) = y₀ + pΔy₀ + p(p−1)/2! · Δ²y₀ + p(p−1)(p−2)/3! · Δ³y₀ + …    where p = (x − x₀)/h"
      : "y(x) = yₙ + p∇yₙ + p(p+1)/2! · ∇²yₙ + p(p+1)(p+2)/3! · ∇³yₙ + …    where p = (x − xₙ)/h";

  return (
    <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_330px]">
      <Panel title="Dataset">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-xs tracking-widest uppercase">
            <tr>
              <th className="pb-2 text-left">x (hour)</th>
              <th className="pb-2 text-right">y (Mbps)</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {points.map((p) => (
              <tr key={p.x} className="border-t">
                <td className="py-2">{p.x}</td>
                <td className="py-2 text-right">{p.y}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-muted-foreground mt-4 space-y-1 text-xs">
          <p>Interval h = {model.h}</p>
          <p>p value = {model.p.toFixed(4)}</p>
          <p>Samples = {points.length}</p>
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title={`${mode === "forward" ? "Forward" : "Backward"} Difference Table`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-muted-foreground text-xs tracking-widest uppercase">
                <tr>
                  <th className="pb-2 text-left">x</th>
                  <th className="pb-2 text-right">y</th>
                  {model.table.slice(1).map((_, i) => (
                    <th key={i} className="pb-2 text-right">
                      {symbol}
                      {i + 1}y
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {points.map((p, r) => (
                  <tr key={p.x} className="border-t">
                    <td className="py-2">{p.x}</td>
                    <td className="py-2 text-right">{p.y}</td>
                    {model.table.slice(1).map((row, i) => (
                      <td key={i} className="text-primary py-2 text-right">
                        {row[r] !== undefined ? row[r]!.toFixed(2) : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Formula Used">
          <pre className="bg-surface-2/60 text-primary overflow-x-auto rounded-xl p-4 font-mono text-xs whitespace-pre-wrap">
            {formula}
          </pre>
        </Panel>

        <Panel title="Graph Comparison">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={curve}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 6" />
              <XAxis dataKey="x" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="predicted" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="actual" stroke="var(--chart-2)" strokeWidth={0} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Prediction Engine">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target hour (x)</Label>
              <Input
                id="target"
                type="number"
                step="0.25"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="bg-surface-2/60 font-mono"
              />
            </div>
            <Slider value={[target]} min={8} max={18} step={0.25} onValueChange={(v) => setTarget(v[0] ?? target)} />
            <motion.div
              key={model.result}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="neon-ring bg-primary/10 rounded-2xl p-5 text-center"
            >
              <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Predicted Traffic</p>
              <p className="font-display text-primary mt-2 text-4xl font-semibold">{model.result.toFixed(2)}</p>
              <p className="text-muted-foreground mt-1 text-xs">Mbps at x = {target}</p>
            </motion.div>
            <Button variant="secondary" className="w-full" onClick={() => setTarget(mode === "forward" ? 9 : 17)}>
              Reset target
            </Button>
          </div>
        </Panel>

        <Panel title="Step-by-Step Calculation">
          <ol className="space-y-2 font-mono text-xs">
            {model.steps.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-surface-2/50 rounded-lg border p-3"
              >
                <span className="text-muted-foreground mr-2">#{i + 1}</span>
                {s.term}
              </motion.li>
            ))}
            <li className="bg-primary/10 text-primary rounded-lg border p-3">Σ = {model.result.toFixed(3)} Mbps</li>
          </ol>
        </Panel>

        <Panel title="Residual Scatter">
          <ResponsiveContainer width="100%" height={160}>
            <ScatterChart>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 6" />
              <XAxis dataKey="x" type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis dataKey="y" type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Scatter data={points} fill="var(--chart-4)" />
            </ScatterChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
