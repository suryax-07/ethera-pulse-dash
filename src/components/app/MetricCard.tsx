import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, type ComponentType } from "react";
import { cn } from "@/lib/utils";

export function Counter({ to, decimals = 0 }: { to: number; decimals?: number | undefined }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) =>
    v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
  );
  useEffect(() => {
    const controls = animate(mv, to, { duration: 1.4, ease: "easeOut" });
    return () => controls.stop();
  }, [mv, to]);
  return <motion.span>{text}</motion.span>;
}

export type Tone = "primary" | "success" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  primary: "text-primary bg-primary/12",
  success: "text-success bg-success/12",
  warning: "text-warning bg-warning/12",
  danger: "text-danger bg-danger/12",
};

export function MetricCard({
  label,
  value,
  unit,
  decimals,
  delta,
  tone = "primary",
  icon: Icon,
  index = 0,
}: {
  label: string;
  value: number;
  unit?: string;
  decimals?: number | undefined;
  delta?: string | undefined;
  tone?: Tone;
  icon: ComponentType<{ className?: string }>;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="glass hover:neon-ring relative overflow-hidden rounded-2xl p-5 transition-shadow"
    >
      <div className="flex items-start justify-between">
        <p className="text-muted-foreground text-xs tracking-[0.14em] uppercase">{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-xl", toneClass[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="font-display mt-4 text-3xl font-semibold">
        <Counter to={value} decimals={decimals} />
        {unit && <span className="text-muted-foreground ml-1 text-sm font-normal">{unit}</span>}
      </p>
      {delta && <p className={cn("mt-1 text-xs", toneClass[tone].split(" ")[0])}>{delta}</p>}
      <div className="bg-primary/40 absolute inset-x-0 bottom-0 h-px" />
    </motion.div>
  );
}

export function Panel({
  title,
  action,
  className,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("glass rounded-2xl p-5", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-sm tracking-[0.14em] uppercase">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
