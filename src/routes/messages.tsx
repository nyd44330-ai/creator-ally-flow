import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

type Conversation = {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  campaign_id: string | null;
  influencer: { id: string; name: string; image: string | null } | null;
  campaign: { name: string } | null;
};

function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("conversations")
      .select(
        "id,last_message,last_message_at,campaign_id,influencer:influencers(id,name,image),campaign:campaigns(name)",
      )
      .eq("advertiser_id", user.id)
      .order("last_message_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setItems((data as unknown as Conversation[] | null) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-24">
      <header className="mx-auto max-w-md px-4 pt-6 pb-3">
        <h1 className="text-lg font-bold text-foreground text-center">رسائلي</h1>
      </header>

      <main className="mx-auto max-w-md px-4">
        {loading || authLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <MessageCircle className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">لا توجد محادثات بعد.</p>
            <Link
              to="/campaign/new"
              className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              إنشاء حملة
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft"
              >
                {c.influencer?.image ? (
                  <img
                    src={c.influencer.image}
                    alt={c.influencer.name}
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-12 rounded-full bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-foreground">
                      {c.influencer?.name ?? "مؤثر"}
                    </p>
                    {c.last_message_at && (
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {new Date(c.last_message_at).toLocaleDateString("ar-DZ", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                  {c.campaign?.name && (
                    <p className="truncate text-[11px] text-primary">{c.campaign.name}</p>
                  )}
                  <p className="truncate text-xs text-muted-foreground">
                    {c.last_message ?? "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
