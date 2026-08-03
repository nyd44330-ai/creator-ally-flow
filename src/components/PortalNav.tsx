import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Inbox, Wallet, MessageCircle, UserRound } from "lucide-react";

const items = [
  { to: "/portal", label: "الرئيسية", icon: LayoutGrid },
  { to: "/portal/offers", label: "العروض", icon: Inbox },
  { to: "/portal/earnings", label: "الأرباح", icon: Wallet },
  { to: "/portal/messages", label: "الرسائل", icon: MessageCircle },
  { to: "/portal/profile", label: "ملفي", icon: UserRound },
] as const;

export function PortalNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <ul className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={
                  "flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-colors " +
                  (active ? "text-accent" : "text-muted-foreground")
                }
              >
                <span
                  className={
                    "flex size-8 items-center justify-center rounded-xl transition-colors " +
                    (active ? "bg-accent-soft" : "")
                  }
                >
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
