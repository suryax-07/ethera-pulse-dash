/** Domain data + numerical interpolation helpers for the traffic predictor. */

export type TrafficPoint = { hour: number; label: string; traffic: number; bandwidth: number; users: number };

const BASE = [
  120, 96, 78, 64, 60, 82, 148, 260, 430, 610, 742, 838, 910, 864, 792, 726, 690, 734, 812, 880, 826, 640, 420, 240,
];

export const hourlyTraffic: TrafficPoint[] = BASE.map((t, hour) => ({
  hour,
  label: `${String(hour).padStart(2, "0")}:00`,
  traffic: t,
  bandwidth: Math.round(t * 1.34 + 60),
  users: Math.round(t * 2.6 + 40),
}));

/** Equally spaced sample used by Newton forward/backward pages. */
export const equalSpacedDataset = [
  { x: 8, y: 430 },
  { x: 10, y: 742 },
  { x: 12, y: 910 },
  { x: 14, y: 792 },
  { x: 16, y: 690 },
  { x: 18, y: 812 },
];

/** Unequally spaced sample used by the divided difference page. */
export const unequalDataset = [
  { x: 1, y: 118 },
  { x: 3, y: 296 },
  { x: 4, y: 425 },
  { x: 7, y: 812 },
  { x: 11, y: 690 },
];

export const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Deterministic heatmap load matrix (weekday x hour), 0-100. */
export const heatmap: number[][] = weekdays.map((_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    const base = BASE[h]! / 9.2;
    const weekendDamp = d >= 5 ? 0.62 : 1;
    const wobble = ((d * 7 + h * 13) % 11) - 5;
    return Math.max(2, Math.min(100, Math.round(base * weekendDamp + wobble)));
  }),
);

export function forwardDifferenceTable(ys: number[]): number[][] {
  const table: number[][] = [ys.slice()];
  for (let level = 1; level < ys.length; level++) {
    const prev = table[level - 1]!;
    const row: number[] = [];
    for (let i = 0; i + 1 < prev.length; i++) row.push(prev[i + 1]! - prev[i]!);
    table.push(row);
  }
  return table;
}

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export type Step = { term: string; value: number };

export function newtonForward(points: { x: number; y: number }[], target: number) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const h = xs[1]! - xs[0]!;
  const p = (target - xs[0]!) / h;
  const table = forwardDifferenceTable(ys);
  let result = ys[0]!;
  let coeff = 1;
  const steps: Step[] = [{ term: `y₀ = ${ys[0]!.toFixed(2)}`, value: ys[0]! }];
  for (let i = 1; i < table.length; i++) {
    if (table[i]!.length === 0) break;
    coeff *= p - (i - 1);
    const termValue = (coeff * table[i]![0]!) / factorial(i);
    result += termValue;
    steps.push({
      term: `(p${i > 1 ? `·(p−${i - 1})` : ""})/${i}! · Δ${i > 1 ? `${i}` : ""}y₀ = ${termValue.toFixed(3)}`,
      value: termValue,
    });
  }
  return { p, h, table, steps, result };
}

export function backwardDifferenceTable(ys: number[]): number[][] {
  return forwardDifferenceTable(ys);
}

export function newtonBackward(points: { x: number; y: number }[], target: number) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const n = ys.length;
  const h = xs[1]! - xs[0]!;
  const p = (target - xs[n - 1]!) / h;
  const table = forwardDifferenceTable(ys);
  let result = ys[n - 1]!;
  let coeff = 1;
  const steps: Step[] = [{ term: `yₙ = ${ys[n - 1]!.toFixed(2)}`, value: ys[n - 1]! }];
  for (let i = 1; i < table.length; i++) {
    const row = table[i]!;
    if (row.length === 0) break;
    coeff *= p + (i - 1);
    const termValue = (coeff * row[row.length - 1]!) / factorial(i);
    result += termValue;
    steps.push({ term: `∇${i}yₙ term = ${termValue.toFixed(3)}`, value: termValue });
  }
  return { p, h, table, steps, result };
}

export function dividedDifferenceTable(points: { x: number; y: number }[]): number[][] {
  const xs = points.map((p) => p.x);
  const table: number[][] = [points.map((p) => p.y)];
  for (let level = 1; level < points.length; level++) {
    const prev = table[level - 1]!;
    const row: number[] = [];
    for (let i = 0; i + 1 < prev.length; i++) {
      row.push((prev[i + 1]! - prev[i]!) / (xs[i + level]! - xs[i]!));
    }
    table.push(row);
  }
  return table;
}

export function newtonDivided(points: { x: number; y: number }[], target: number) {
  const xs = points.map((p) => p.x);
  const table = dividedDifferenceTable(points);
  let result = table[0]![0]!;
  let product = 1;
  const steps: Step[] = [{ term: `f[x₀] = ${table[0]![0]!.toFixed(3)}`, value: table[0]![0]! }];
  const polyParts: string[] = [table[0]![0]!.toFixed(3)];
  for (let i = 1; i < table.length; i++) {
    if (table[i]!.length === 0) break;
    product *= target - xs[i - 1]!;
    const coeff = table[i]![0]!;
    const value = product * coeff;
    result += value;
    steps.push({ term: `f[x₀..x${i}] · Π(x−xᵢ) = ${value.toFixed(3)}`, value });
    polyParts.push(
      `${coeff >= 0 ? "+" : "−"} ${Math.abs(coeff).toFixed(3)}${Array.from({ length: i }, (_, k) => `(x−${xs[k]})`).join("")}`,
    );
  }
  return { table, steps, result, polynomial: `P(x) = ${polyParts.join(" ")}` };
}

export function interpolateCurve(
  points: { x: number; y: number }[],
  fn: (pts: { x: number; y: number }[], t: number) => { result: number },
  samples = 60,
) {
  const min = points[0]!.x;
  const max = points[points.length - 1]!.x;
  const out: { x: number; predicted: number; actual: number | null }[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = min + ((max - min) * i) / samples;
    const actual = points.find((p) => Math.abs(p.x - x) < 1e-9)?.y ?? null;
    out.push({ x: Number(x.toFixed(2)), predicted: Number(fn(points, x).result.toFixed(2)), actual });
  }
  return out;
}

export const aiInsights = [
  {
    title: "Traffic expected to increase by 22%",
    detail: "Forward interpolation over the last 6 samples projects 22.4% growth in the 12:00–14:00 window.",
    level: "info" as const,
  },
  {
    title: "Bandwidth upgrade recommended",
    detail: "Sustained utilisation above 78% for 4h/day. Provision +350 Mbps on the core uplink.",
    level: "warn" as const,
  },
  {
    title: "Peak congestion predicted at 12:15 PM",
    detail: "Divided-difference model places the maximum at x = 12.25 with 934 Mbps demand.",
    level: "warn" as const,
  },
  {
    title: "Risk Level: Medium",
    detail: "Congestion probability 46% during peak. Access points AP-07 and AP-12 are the hot spots.",
    level: "danger" as const,
  },
];
