import { formatDistanceToNow, format } from "date-fns";
import { MapPin, Phone, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { categoryOf, waLink, type Item } from "@/lib/items";

export function ItemCard({ item }: { item: Item }) {
  const cat = categoryOf(item.category);
  const Icon = cat.icon;
  const msg = `Hi, about the ${item.kind} ${item.name} posted on FoundIt`;

  const share = async () => {
    const text = `${item.kind === "lost" ? "LOST" : "FOUND"}: ${item.name} — ${item.location}. Contact ${item.phone}`;
    if (navigator.share) {
      try { await navigator.share({ title: item.name, text, url: window.location.origin }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="relative aspect-[4/3] w-full bg-secondary">
        {item.photo_url ? (
          <img src={item.photo_url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Icon className="h-14 w-14" />
            <span className="text-xs">No photo provided</span>
          </div>
        )}
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase ${item.kind === "lost" ? "bg-lost text-lost-foreground" : "bg-found text-found-foreground"}`}>{item.kind}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${item.kind === "lost" ? "bg-lost text-lost-foreground" : "bg-found text-found-foreground"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold leading-tight">{item.name}</h3>
            <p className="text-xs text-muted-foreground">
              {cat.label} · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" /> {item.location}
          <span className="text-muted-foreground">· {format(new Date(item.item_date), "d MMM")}</span>
        </p>
        {item.description && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>}
        {item.audio_url && <audio controls src={item.audio_url} className="mt-3 h-9 w-full" />}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <a href={waLink(item.phone, msg)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl bg-found py-2.5 text-sm font-semibold text-found-foreground">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a href={`tel:${item.phone}`} className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
            <Phone className="h-4 w-4" /> Call
          </a>
          <button onClick={share} className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-sm font-semibold">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
    </article>
  );
}
