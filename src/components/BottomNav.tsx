import { Link } from "@tanstack/react-router";
import { Home, Heart, MessageCircle, Briefcase, User } from "lucide-react";

const items = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/favorites", label: "المفضلة", icon: Heart },
  { to: "/messages", label: "رسائلي", icon: MessageCircle },
  { to: "/campaigns", label: "حملاتي", icon: Briefcase },
  { to: "/account", label: "حسابي", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <ul className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              <Icon className="size-5" strokeWidth={2} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
