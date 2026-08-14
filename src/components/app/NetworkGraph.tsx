import { motion } from "motion/react";

type Node = { id: string; label: string; x: number; y: number; tier: string; health: number };

const NODES: Node[] = [
  { id: "net", label: "Internet", x: 500, y: 46, tier: "WAN", health: 99 },
  { id: "rtr", label: "Core Router", x: 500, y: 150, tier: "L3", health: 97 },
  { id: "sw1", label: "Switch A", x: 300, y: 254, tier: "L2", health: 95 },
  { id: "sw2", label: "Switch B", x: 700, y: 254, tier: "L2", health: 88 },
  { id: "ap1", label: "AP-03", x: 180, y: 358, tier: "WiFi", health: 93 },
  { id: "ap2", label: "AP-07", x: 400, y: 358, tier: "WiFi", health: 71 },
  { id: "ap3", label: "AP-12", x: 620, y: 358, tier: "WiFi", health: 64 },
  { id: "ap4", label: "AP-15", x: 830, y: 358, tier: "WiFi", health: 96 },
  { id: "u1", label: "142 Users", x: 180, y: 456, tier: "Edge", health: 100 },
  { id: "u2", label: "318 Users", x: 400, y: 456, tier: "Edge", health: 100 },
  { id: "u3", label: "276 Users", x: 620, y: 456, tier: "Edge", health: 100 },
  { id: "u4", label: "96 Users", x: 830, y: 456, tier: "Edge", health: 100 },
];

const LINKS: [string, string][] = [
  ["net", "rtr"],
  ["rtr", "sw1"],
  ["rtr", "sw2"],
  ["sw1", "ap1"],
  ["sw1", "ap2"],
  ["sw2", "ap3"],
  ["sw2", "ap4"],
  ["ap1", "u1"],
  ["ap2", "u2"],
  ["ap3", "u3"],
  ["ap4", "u4"],
];

const byId = (id: string) => NODES.find((n) => n.id === id)!;

function healthColor(h: number) {
  if (h >= 90) return "var(--success)";
  if (h >= 75) return "var(--warning)";
  return "var(--danger)";
}

export function NetworkGraph() {
  return (
    <div className="grid-bg relative overflow-hidden rounded-2xl">
      <svg viewBox="0 0 1000 510" className="h-full w-full" role="img" aria-label="Live network topology">
        {LINKS.map(([a, b]) => {
          const from = byId(a);
          const to = byId(b);
          const path = `M ${from.x} ${from.y} C ${from.x} ${(from.y + to.y) / 2}, ${to.x} ${(from.y + to.y) / 2}, ${to.x} ${to.y}`;
          return (
            <g key={`${a}-${b}`}>
              <path d={path} fill="none" stroke="var(--border)" strokeWidth={2} />
              <path
                d={path}
                fill="none"
                stroke="var(--neon)"
                strokeWidth={2}
                strokeDasharray="6 18"
                className="animate-dash-flow"
                opacity={0.75}
              />
              <circle r={4} fill="var(--neon)">
                <animateMotion dur={`${1.8 + (a.length % 3) * 0.5}s`} repeatCount="indefinite" path={path} />
              </circle>
            </g>
          );
        })}

        {NODES.map((n, i) => (
          <motion.g
            key={n.id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <circle r={30} cx={n.x} cy={n.y} fill="var(--surface)" stroke={healthColor(n.health)} strokeWidth={2} />
            <circle r={38} cx={n.x} cy={n.y} fill="none" stroke={healthColor(n.health)} strokeWidth={1} opacity={0.28}>
              <animate attributeName="r" values="30;46;30" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="3s" repeatCount="indefinite" />
            </circle>
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={11} fill="var(--foreground)" fontWeight={600}>
              {n.tier}
            </text>
            <text x={n.x} y={n.y + 50} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">
              {n.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
