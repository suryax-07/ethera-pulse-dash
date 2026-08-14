import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "@/components/app/MetricCard";
import { Shell } from "@/components/app/Shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { interpolateCurve, newtonDivided, unequalDataset } from "@/lib/network";

export const Route = createFileRoute("/divided-difference")({
  head: () => ({
    meta: [
      { title: "Divided Difference · Smart Network Traffic Predictor" },
      {
        name: "description",
        content: "Newton divided difference table, generated polynomial and prediction engine for unequally spaced traffic samples.",
      },
      { property: "og:title", content: "Newton Divided Difference Console" },
      { property: "og:description", content: "Unequal interval interpolation with a generated polynomial." },
    ],
  }),
  component: DividedPage,
});

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--popover-foreground)",
  fontSize: 12,
};

function DividedPage() {
  const points = unequalDataset;
  const [target, setTarget] = useState(6);
  const model = useMemo(() => newtonDivided(points, target), [points, target]);
  const curve = useMemo(() => interpolateCurve(points, newtonDivided, 80), [points]);

  return (
    <Shell title="Newton Divided Difference" subtitle="Unequal interval sampling · generated polynomial model">
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel title="Unequal Interval Data">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-xs tracking-widest uppercase">
                <tr>
                  <th className="pb-2 text-left">x</th>
                  <th className="pb-2 text-right">f(x)</th>
                  <th className="pb-2 text-right">Δx</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {points.map((p, i) => (
                  <tr key={p.x} className="border-t">
                    <td className="py-2">{p.x}</td>
                    <td className="py-2 text-right">{p.y}</td>
                    <td className="text-muted-foreground py-2 text-right">
                      {i === 0 ? "—" : p.x - points[i - 1]!.x}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Prediction Result">
            <div className="space-y-3">
              <Label htmlFor="x">Evaluate at x</Label>
              <Input
                id="x"
                type="number"
                step="0.5"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="bg-surface-2/60 font-mono"
              />
              <motion.div
                key={model.result}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="neon-ring bg-primary/10 rounded-2xl p-5 text-center"
              >
                <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Predicted Load</p>
                <p className="font-display text-primary mt-2 text-4xl font-semibold">{model.result.toFixed(2)}</p>
                <p className="text-muted-foreground mt-1 text-xs">Mbps</p>
              </motion.div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Divided Difference Table">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-muted-foreground text-xs tracking-widest uppercase">
                  <tr>
                    <th className="pb-2 text-left">x</th>
                    {model.table.map((_, i) => (
                      <th key={i} className="pb-2 text-right">
                        {i === 0 ? "f(x)" : `f[x₀..x${i}]`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {points.map((p, r) => (
                    <tr key={p.x} className="border-t">
                      <td className="py-2">{p.x}</td>
                      {model.table.map((row, i) => (
                        <td key={i} className={i === 0 ? "py-2 text-right" : "text-primary py-2 text-right"}>
                          {row[r] !== undefined ? row[r]!.toFixed(3) : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Interactive Formula Viewer">
            <Tabs defaultValue="poly">
              <TabsList>
                <TabsTrigger value="poly">Polynomial</TabsTrigger>
                <TabsTrigger value="general">General Form</TabsTrigger>
                <TabsTrigger value="steps">Steps</TabsTrigger>
              </TabsList>
              <TabsContent value="poly">
                <pre className="bg-surface-2/60 text-primary overflow-x-auto rounded-xl p-4 font-mono text-xs whitespace-pre-wrap">
                  {model.polynomial}
                </pre>
              </TabsContent>
              <TabsContent value="general">
                <pre className="bg-surface-2/60 text-primary overflow-x-auto rounded-xl p-4 font-mono text-xs whitespace-pre-wrap">
                  {"P(x) = f[x₀] + (x−x₀)f[x₀,x₁] + (x−x₀)(x−x₁)f[x₀,x₁,x₂] + …\nf[xᵢ,xⱼ] = (f[xⱼ] − f[xᵢ]) / (xⱼ − xᵢ)"}
                </pre>
              </TabsContent>
              <TabsContent value="steps">
                <ol className="space-y-2 font-mono text-xs">
                  {model.steps.map((s, i) => (
                    <li key={i} className="bg-surface-2/50 rounded-lg border p-3">
                      <span className="text-muted-foreground mr-2">#{i + 1}</span>
                      {s.term}
                    </li>
                  ))}
                </ol>
              </TabsContent>
            </Tabs>
          </Panel>

          <Panel title="Polynomial Fit">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={curve}>
                <CartesianGrid stroke="var(--grid)" strokeDasharray="3 6" />
                <XAxis dataKey="x" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="predicted" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="actual" stroke="var(--chart-2)" strokeWidth={0} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}
