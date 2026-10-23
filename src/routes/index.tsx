import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ItemCard } from "@/components/ItemCard";
import { CATEGORIES, LOCATIONS, type Item, type Kind } from "@/lib/items";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FoundIt — Campus Lost & Found" },
      { name: "description", content: "Browse items lost and found around campus and contact the owner or finder instantly." },
      { property: "og:title", content: "FoundIt — Campus Lost & Found" },
      { property: "og:description", content: "Browse items lost and found around campus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Feed,
});

const DATES = [
  { v: "all", l: "Any time" },
  { v: "1", l: "Today" },
  { v: "7", l: "This week" },
  { v: "30", l: "This month" },
];

function Feed() {
  const [kind, setKind] = useState<Kind>("lost");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [loc, setLoc] = useState("all");
  const [days, setDays] = useState("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data as Item[];
    },
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const cutoff = days === "all" ? 0 : Date.now() - Number(days) * 86400000;
    return data.filter(
      (i) =>
        i.kind === kind &&
        (cat === "all" || i.category === cat) &&
        (loc === "all" || i.location === loc) &&
        (!cutoff || new Date(i.item_date).getTime() >= cutoff - 86400000) &&
        (!s || `${i.name} ${i.description ?? ""} ${i.location}`.toLowerCase().includes(s)),
    );
  }, [data, kind, q, cat, loc, days]);

  const sel = "rounded-xl border bg-card px-3 py-2 text-sm";

  return (
    <AppShell>
      <div className="px-5">
        <div className="grid grid-cols-2 rounded-2xl bg-secondary p-1">
          {(["lost", "found"] as Kind[]).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-xl py-2.5 text-sm font-bold capitalize transition ${kind === k ? (k === "lost" ? "bg-lost text-lost-foreground" : "bg-found text-found-foreground") : "text-muted-foreground"}`}
            >
              {k} items
            </button>
          ))}
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search e.g. "iPhone 13"' className="w-full rounded-xl border bg-card py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={sel} aria-label="Category">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={days} onChange={(e) => setDays(e.target.value)} className={sel} aria-label="Date">
            {DATES.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
          </select>
          <select value={loc} onChange={(e) => setLoc(e.target.value)} className={sel} aria-label="Location">
            <option value="all">All locations</option>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="mt-5 space-y-4">
          {isLoading ? (
            <p className="py-12 text-center text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No {kind} items match yet.</p>
          ) : (
            filtered.map((i) => <ItemCard key={i.id} item={i} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
