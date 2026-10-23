import { Link } from "@tanstack/react-router";
import { LayoutGrid, PlusCircle } from "lucide-react";
import type { ReactNode } from "react";
import { NotificationBell } from "./Notifications";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl pb-28">
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <Link to="/" className="font-display text-2xl font-extrabold tracking-tight">
          Found<span className="text-accent-foreground bg-accent px-1.5 rounded-md ml-0.5">It</span>
        </Link>
        <NotificationBell />
      </header>
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-2">
          <Link to="/" className="flex flex-col items-center gap-1 py-3 text-xs font-medium text-muted-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
            <LayoutGrid className="h-5 w-5" /> Feed
          </Link>
          <Link to="/report" className="flex flex-col items-center gap-1 py-3 text-xs font-medium text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <PlusCircle className="h-5 w-5" /> Report
          </Link>
        </div>
      </nav>
    </div>
  );
}
