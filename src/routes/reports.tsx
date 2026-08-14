import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { FileDown, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/MetricCard";
import { Shell } from "@/components/app/Shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { aiInsights, equalSpacedDataset, hourlyTraffic, newtonForward } from "@/lib/network";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Report Center · Smart Network Traffic Predictor" },
      {
        name: "description",
        content: "Export dataset summaries, interpolation results, difference tables and peak analysis as PDF, Excel or Word.",
      },
      { property: "og:title", content: "Report Center" },
      { property: "og:description", content: "Downloadable network analysis reports in PDF, Excel and Word." },
    ],
  }),
  component: ReportsPage,
});

const SECTIONS = [
  "Dataset Summary",
  "Interpolation Results",
  "Difference Tables",
  "Graphs",
  "Peak Analysis",
  "Simulation Results",
  "Recommendations",
];

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  const [selected, setSelected] = useState<string[]>(SECTIONS);
  const model = newtonForward(equalSpacedDataset, 9);

  const summaryLines = [
    "SMART NETWORK TRAFFIC PREDICTOR — ANALYSIS REPORT",
    `Generated: ${new Date().toUTCString()}`,
    `Sections: ${selected.join(", ")}`,
    "",
    "Dataset Summary: 24 hourly samples, 4 columns, 2 missing values, 0 duplicates.",
    `Interpolation (Newton Forward, x=9): ${model.result.toFixed(3)} Mbps`,
    "Peak Analysis: peak hour 12:00 at 910 Mbps, congestion window 10:00-15:00.",
    "Simulation: predicted growth +22.0%, bandwidth required 1,912 Mbps.",
    "",
    "Recommendations:",
    ...aiInsights.map((i) => `- ${i.title}: ${i.detail}`),
  ];

  const csv = [
    "hour,traffic_mbps,bandwidth_mbps,active_users",
    ...hourlyTraffic.map((p) => `${p.label},${p.traffic},${p.bandwidth},${p.users}`),
  ].join("\n");

  return (
    <Shell title="Report Center" subtitle="Compile and export a full network analysis package">
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Panel title="Report Contents">
          <div className="space-y-3">
            {SECTIONS.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <Checkbox
                  id={s}
                  checked={selected.includes(s)}
                  onCheckedChange={(c) =>
                    setSelected((prev) => (c ? [...prev, s] : prev.filter((x) => x !== s)))
                  }
                />
                <Label htmlFor={s} className="text-sm font-normal">
                  {s}
                </Label>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "PDF Report",
              desc: "Print-ready layout with charts and tables.",
              icon: Printer,
              action: () => {
                toast.success("Opening print dialog — choose “Save as PDF”.");
                setTimeout(() => window.print(), 300);
              },
            },
            {
              title: "Excel Workbook",
              desc: "Raw dataset and difference tables in CSV/XLSX-compatible form.",
              icon: FileSpreadsheet,
              action: () => {
                download("network-traffic-report.csv", csv, "text/csv");
                toast.success("Excel-compatible dataset exported.");
              },
            },
            {
              title: "Word Document",
              desc: "Narrative summary with recommendations.",
              icon: FileText,
              action: () => {
                download(
                  "network-traffic-report.doc",
                  `<html><body><pre>${summaryLines.join("\n")}</pre></body></html>`,
                  "application/msword",
                );
                toast.success("Word report exported.");
              },
            },
          ].map((c, i) => (
            <motion.button
              key={c.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              onClick={c.action}
              className="glass hover:neon-ring rounded-2xl p-6 text-left transition-shadow"
            >
              <span className="bg-primary/12 text-primary grid size-10 place-items-center rounded-xl">
                <c.icon className="size-5" />
              </span>
              <h3 className="font-display mt-4 text-lg">{c.title}</h3>
              <p className="text-muted-foreground mt-1 text-xs">{c.desc}</p>
              <span className="text-primary mt-4 flex items-center gap-2 text-xs">
                <FileDown className="size-4" /> Download
              </span>
            </motion.button>
          ))}

          <div className="sm:col-span-3">
            <Panel title="Report Preview">
              <pre className="bg-surface-2/50 max-h-96 overflow-auto rounded-xl border p-4 font-mono text-xs whitespace-pre-wrap">
                {summaryLines.join("\n")}
              </pre>
            </Panel>
          </div>
        </div>
      </div>
    </Shell>
  );
}
