import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/app/MetricCard";
import { Shell } from "@/components/app/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Smart Network Traffic Predictor" },
      {
        name: "description",
        content: "Configure theme, export preferences, calculation precision and operator profile for the NOC console.",
      },
      { property: "og:title", content: "Console Settings" },
      { property: "og:description", content: "Theme, export format, precision and operator profile." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(true);
  const [precision, setPrecision] = useState(3);
  const [format, setFormat] = useState("pdf");
  const [name, setName] = useState("Network Operator");
  const [email, setEmail] = useState("operator@netlab.edu");

  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);

  useEffect(() => {
    const stored = localStorage.getItem("sntp.user");
    if (stored) setEmail(stored);
  }, []);

  return (
    <Shell title="Settings" subtitle="Console preferences and operator profile">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Appearance">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark NOC theme</p>
              <p className="text-muted-foreground text-xs">Optimised for low-light control rooms.</p>
            </div>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>
        </Panel>

        <Panel title="Export Preferences">
          <div className="space-y-2">
            <Label>Default export format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="bg-surface-2/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
                <SelectItem value="docx">Word</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Panel>

        <Panel title="Calculation Precision">
          <p className="font-display text-primary text-3xl">{precision} decimals</p>
          <Slider
            className="mt-4"
            value={[precision]}
            min={0}
            max={8}
            step={1}
            onValueChange={(v) => setPrecision(v[0] ?? precision)}
          />
          <p className="text-muted-foreground mt-3 text-xs">
            Applied to difference tables, polynomial coefficients and prediction outputs.
          </p>
        </Panel>

        <Panel title="User Profile">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-2/60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-surface-2/60" />
            </div>
            <Button
              onClick={() => {
                localStorage.setItem("sntp.user", email);
                toast.success("Preferences saved.");
              }}
            >
              Save changes
            </Button>
          </div>
        </Panel>
      </div>
    </Shell>
  );
}
