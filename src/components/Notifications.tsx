import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Item } from "@/lib/items";

type Ctx = { items: Item[]; unread: number; markRead: () => void; enable: () => void; permission: string };
const NotifCtx = createContext<Ctx | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
    const channel = supabase
      .channel("items-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "items" }, (payload) => {
        const item = payload.new as Item;
        setItems((p) => [item, ...p].slice(0, 30));
        setUnread((n) => n + 1);
        qc.invalidateQueries({ queryKey: ["items"] });
        const title = item.kind === "found" ? "Item found" : "Item reported lost";
        const body = `${item.name} · ${item.location}`;
        toast(title, { description: body });
        if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
          new Notification(title, { body });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const enable = async () => {
    if (!("Notification" in window)) return toast.error("This browser doesn't support alerts");
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") toast.success("Alerts on — we'll ping you about new items");
  };

  return (
    <NotifCtx.Provider value={{ items, unread, markRead: () => setUnread(0), enable, permission }}>
      {children}
    </NotifCtx.Provider>
  );
}

export function NotificationBell() {
  const ctx = useContext(NotifCtx)!;
  return (
    <Sheet onOpenChange={(o) => o && ctx.markRead()}>
      <SheetTrigger asChild>
        <button aria-label="Notifications" className="relative rounded-full bg-card p-2.5 shadow-card">
          <Bell className="h-5 w-5" />
          {ctx.unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lost px-1 text-xs font-bold text-lost-foreground">
              {ctx.unread}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 px-4">
          {ctx.permission !== "granted" && (
            <div className="rounded-xl bg-secondary p-4 text-sm">
              <p className="mb-3">Get phone alerts when new items are posted, even when this tab is in the background.</p>
              <Button size="sm" onClick={ctx.enable}>Turn on alerts</Button>
            </div>
          )}
          {ctx.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">New lost and found posts will show up here.</p>
          ) : (
            ctx.items.map((i) => (
              <div key={i.id} className="rounded-xl border bg-card p-3">
                <span className={`text-xs font-semibold uppercase ${i.kind === "found" ? "text-found" : "text-lost"}`}>{i.kind}</span>
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-muted-foreground">
                  {i.location} · {formatDistanceToNow(new Date(i.created_at), { addSuffix: true })}
                </p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
