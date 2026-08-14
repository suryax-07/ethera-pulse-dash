import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpDown, CloudUpload, Copy, FileSpreadsheet, Rows3, TriangleAlert } from "lucide-react";
import { MetricCard, Panel } from "@/components/app/MetricCard";
import { Shell } from "@/components/app/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { hourlyTraffic } from "@/lib/network";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Dataset Upload · Smart Network Traffic Predictor" },
      {
        name: "description",
        content: "Drag and drop CSV or XLSX traffic datasets, inspect row counts, missing values and duplicates.",
      },
      { property: "og:title", content: "Dataset Upload Console" },
      { property: "og:description", content: "Upload and profile network traffic datasets." },
    ],
  }),
  component: UploadPage,
});

type Row = { label: string; traffic: number; bandwidth: number; users: number };
type SortKey = keyof Row;

const PAGE_SIZE = 8;

function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("campus_traffic_24h.csv");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "label", dir: 1 });
  const [page, setPage] = useState(0);

  const rows: Row[] = hourlyTraffic.map(({ label, traffic, bandwidth, users }) => ({
    label,
    traffic,
    bandwidth,
    users,
  }));

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    return [...list].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
    });
  }, [rows, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const view = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <Shell title="Dataset Upload" subtitle="Ingest traffic logs and profile them before interpolation">
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) setFileName(f.name);
        }}
        onClick={() => inputRef.current?.click()}
        animate={{ scale: dragging ? 1.01 : 1 }}
        className={cn(
          "glass mb-6 cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFileName(f.name);
          }}
        />
        <CloudUpload className="text-primary mx-auto size-12 animate-float-slow" />
        <p className="font-display mt-4 text-lg">Drop your dataset here</p>
        <p className="text-muted-foreground mt-1 text-sm">or click to browse · CSV, XLSX up to 25 MB</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Badge variant="secondary">CSV</Badge>
          <Badge variant="secondary">XLSX</Badge>
        </div>
      </motion.div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Rows" value={24} icon={Rows3} index={0} />
        <MetricCard label="Columns" value={4} icon={FileSpreadsheet} index={1} />
        <MetricCard label="Missing Values" value={2} icon={TriangleAlert} tone="warning" index={2} />
        <MetricCard label="Duplicates" value={0} icon={Copy} tone="success" index={3} />
      </div>

      <Panel
        title={`Dataset Preview — ${fileName}`}
        action={
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search rows…"
            className="bg-surface-2/60 h-9 w-48"
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-muted-foreground text-xs tracking-widest uppercase">
              <tr>
                {(["label", "traffic", "bandwidth", "users"] as SortKey[]).map((k) => (
                  <th key={k} className="pb-3 text-left">
                    <button
                      className="hover:text-foreground flex items-center gap-1"
                      onClick={() => setSort((s) => ({ key: k, dir: s.key === k && s.dir === 1 ? -1 : 1 }))}
                    >
                      {k === "label" ? "hour" : k}
                      <ArrowUpDown className="size-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono">
              {view.map((r) => (
                <tr key={r.label} className="hover:bg-surface-2/50 border-t transition-colors">
                  <td className="py-2.5">{r.label}</td>
                  <td className="text-primary py-2.5">{r.traffic}</td>
                  <td className="py-2.5">{r.bandwidth}</td>
                  <td className="py-2.5">{r.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            Page {page + 1} of {pages} · {filtered.length} rows
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Panel>
    </Shell>
  );
}
