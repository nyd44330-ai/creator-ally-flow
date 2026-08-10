import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Inbox, Wallet, MessageSquare, UserCircle } from "lucide-react";

const items = [
  { to: "/portal", label: "الرئيسية", icon: LayoutGrid, exact: true },
  { to: "/portal/offers", label: "العروض", icon: Inbox, exact: false },
  { to: "/portal/earnings", label: "الأرباح", icon: Wallet, exact: false },
  { to: "/portal/messages", label: "الرسائل", icon: MessageSquare, exact: false },
  { to: "/portal/profile", label: "ملفي", icon: UserCircle, exact: false },
] as const;

export function PortalNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 px-3 pb-3">
      <ul className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-border bg-surface/95 px-2 py-2 shadow-card backdrop-blur">
        {items.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors " +
                  (active ? "bg-accent-soft text-accent" : "text-muted-foreground")
                }
              >
                <Icon className="size-5" strokeWidth={2} />
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
