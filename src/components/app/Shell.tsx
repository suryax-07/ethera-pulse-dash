import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Bell,
  ChartNoAxesCombined,
  CircuitBoard,
  Database,
  FileBarChart,
  Flame,
  LayoutDashboard,
  LogOut,
  Radar,
  Search,
  Settings,
  Sigma,
  SquareSigma,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Dataset Upload", icon: Database },
  { to: "/newton-forward", label: "Newton Forward", icon: Sigma },
  { to: "/newton-backward", label: "Newton Backward", icon: SquareSigma },
  { to: "/divided-difference", label: "Divided Difference", icon: ChartNoAxesCombined },
  { to: "/peak-analysis", label: "Peak Traffic Analysis", icon: Flame },
  { to: "/simulation", label: "Network Simulation", icon: Radar },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function useSession() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    setEmail(localStorage.getItem("sntp.user"));
  }, []);
  return email;
}

export function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState("operator@netlab.edu");

  useEffect(() => {
    const stored = localStorage.getItem("sntp.user");
    if (!stored) void navigate({ to: "/" });
    else setUser(stored);
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <header className="glass-strong sticky top-0 z-50 flex h-16 items-center gap-3 px-4 md:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="neon-ring grid size-9 place-items-center rounded-xl bg-primary/15">
            <CircuitBoard className="size-5 text-primary" />
          </span>
          <span className="hidden font-display text-sm leading-tight font-semibold sm:block">
            SMART NETWORK
            <span className="text-gradient block text-[11px] tracking-[0.22em]">TRAFFIC PREDICTOR</span>
          </span>
        </Link>

        <div className="relative mx-auto hidden w-full max-w-md md:block">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input placeholder="Search nodes, datasets, reports…" className="bg-surface-2/60 pl-9" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            <span className="bg-danger absolute top-2 right-2 size-2 animate-pulse-dot rounded-full" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">NO</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground hidden text-xs lg:block">{user}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Network Operator</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void navigate({ to: "/settings" })}>
                <Settings className="mr-2 size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("sntp.user");
                  void navigate({ to: "/" });
                }}
              >
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        <aside className="bg-sidebar/70 sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r p-3 backdrop-blur-xl lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="bg-primary absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full"
                  />
                )}
                <item.icon className={cn("size-4", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
          <div className="glass mt-auto rounded-xl p-3">
            <p className="text-muted-foreground text-[11px] tracking-widest uppercase">Core Uplink</p>
            <p className="text-success mt-1 flex items-center gap-2 text-sm font-medium">
              <Activity className="size-4" /> Stable · 12ms
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <nav className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "glass shrink-0 rounded-full px-3 py-1.5 text-xs whitespace-nowrap",
                  pathname === item.to ? "text-primary border-primary/40" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="mb-6">
              <h1 className="font-display text-2xl font-semibold md:text-3xl">{title}</h1>
              {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
            </div>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
