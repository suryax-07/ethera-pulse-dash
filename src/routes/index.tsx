import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { CircuitBoard, Globe2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In · Smart Network Traffic Predictor" },
      {
        name: "description",
        content:
          "Secure operator sign-in for the Smart Network Traffic Predictor — a NOC-grade traffic forecasting and interpolation console.",
      },
      { property: "og:title", content: "Sign In · Smart Network Traffic Predictor" },
      {
        property: "og:description",
        content: "NOC-grade network traffic forecasting console with Newton interpolation analytics.",
      },
    ],
  }),
  component: LoginPage,
});

function OrbitVisual() {
  const rings = [70, 108, 146, 184];
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 460 460" className="w-[min(88%,520px)]">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="var(--neon)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--neon)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={230} cy={230} r={210} fill="url(#glow)" />
        {rings.map((r, i) => (
          <g key={r}>
            <circle
              cx={230}
              cy={230}
              r={r}
              fill="none"
              stroke="var(--border)"
              strokeDasharray={i % 2 ? "4 10" : undefined}
            />
            <circle r={5} fill="var(--neon)">
              <animateMotion
                dur={`${6 + i * 2.5}s`}
                repeatCount="indefinite"
                path={`M 230 ${230 - r} A ${r} ${r} 0 1 1 229.9 ${230 - r} A ${r} ${r} 0 1 1 230 ${230 - r}`}
              />
            </circle>
          </g>
        ))}
        <ellipse cx={230} cy={230} rx={150} ry={56} fill="none" stroke="var(--primary)" opacity={0.35} />
        <ellipse
          cx={230}
          cy={230}
          rx={56}
          ry={150}
          fill="none"
          stroke="var(--primary)"
          opacity={0.35}
        />
        <circle cx={230} cy={230} r={46} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = Number((230 + Math.cos(rad) * 146).toFixed(2));
          const y = Number((230 + Math.sin(rad) * 146).toFixed(2));
          return (
            <g key={deg}>
              <line x1={230} y1={230} x2={x} y2={y} stroke="var(--neon)" strokeWidth={1} opacity={0.35} />
              <circle cx={x} cy={y} r={7} fill="var(--surface-2)" stroke="var(--neon)" strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
      <Globe2 className="text-primary absolute size-10" />
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("operator@netlab.edu");
  const [password, setPassword] = useState("network123");
  const [loading, setLoading] = useState(false);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="grid-bg relative hidden items-center overflow-hidden border-r lg:flex">
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <span className="neon-ring grid size-10 place-items-center rounded-xl bg-primary/15">
              <CircuitBoard className="size-5 text-primary" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold">NETLAB INSTITUTE OF TECHNOLOGY</p>
              <p className="text-muted-foreground text-xs tracking-[0.2em]">NETWORK OPERATIONS CENTER</p>
            </div>
          </div>
          <div className="mt-auto max-w-md">
            <h2 className="font-display text-3xl leading-tight font-semibold">
              Forecast every packet before it hits the wire.
            </h2>
            <p className="text-muted-foreground mt-3 text-sm">
              Newton interpolation engines, live topology telemetry and peak-load prediction in one enterprise console.
            </p>
          </div>
        </div>
        <OrbitVisual />
      </div>

      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-strong neon-ring w-full max-w-md rounded-3xl p-8"
        >
          <span className="neon-ring mb-5 grid size-12 place-items-center rounded-2xl bg-primary/15">
            <CircuitBoard className="size-6 text-primary" />
          </span>
          <h1 className="font-display text-2xl font-semibold">Smart Network Traffic Predictor</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign in with your operator credentials.</p>

          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              localStorage.setItem("sntp.user", email);
              setTimeout(() => void navigate({ to: "/dashboard" }), 650);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-surface-2/60 pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-surface-2/60 pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Establishing secure session…" : "Sign In"}
            </Button>
          </form>

          <p className="text-muted-foreground mt-6 flex items-center gap-2 text-xs">
            <ShieldCheck className="text-success size-4" /> TLS 1.3 · Session encrypted · Demo credentials pre-filled
          </p>
        </motion.div>
      </div>
    </div>
  );
}
