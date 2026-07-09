import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Heart, MessageCircle, Briefcase, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

const items = [
  { to: "/", label: "الرئيسية", icon: Home, protected: false },
  { to: "/favorites", label: "المفضلة", icon: Heart, protected: true },
  { to: "/messages", label: "رسائلي", icon: MessageCircle, protected: true },
  { to: "/campaigns", label: "حملاتي", icon: Briefcase, protected: true },
  { to: "/account", label: "حسابي", icon: User, protected: true },
] as const;

export function BottomNav() {
  const { isAuthed, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <ul className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
        {items.map(({ to, label, icon: Icon, protected: needsAuth }) => {
          const active = pathname === to;
          const cls =
            "flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-colors " +
            (active ? "text-primary" : "text-muted-foreground");
          if (needsAuth && !loading && !isAuthed) {
            return (
              <li key={to} className="flex-1">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/auth", search: { next: to } })}
                  className={cls + " w-full"}
                >
                  <Icon className="size-5" strokeWidth={2} />
                  <span className="text-[11px] font-medium">{label}</span>
                </button>
              </li>
            );
          }
          return (
            <li key={to} className="flex-1">
              <Link to={to} activeOptions={{ exact: true }} className={cls}>
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
