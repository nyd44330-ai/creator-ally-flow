import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, MessageSquare, Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInfluencerSelf } from "@/lib/portal";

export const Route = createFileRoute("/portal/messages")({
  component: PortalMessages,
});

type ConversationRow = {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  campaign: { name: string } | null;
};

type MessageRow = {
  id: string;
  sender: string;
  body: string;
  created_at: string;
};

function PortalMessages() {
  const { influencer, loading } = useInfluencerSelf();
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();

  const conversations = useQuery({
    queryKey: ["portal", "conversations", influencer?.id],
    enabled: !!influencer,
    queryFn: async (): Promise<ConversationRow[]> => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id,last_message,last_message_at,campaign:campaigns(name)")
        .eq("influencer_id", influencer!.id)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as ConversationRow[]) ?? [];
    },
  });

  const messages = useQuery({
    queryKey: ["portal", "messages", openId],
    enabled: !!openId,
    queryFn: async (): Promise<MessageRow[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("id,sender,body,created_at")
        .eq("conversation_id", openId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as MessageRow[]) ?? [];
    },
  });

  const send = async () => {
    const body = draft.trim();
    if (!body || !openId) return;
    setSending(true);
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: openId, sender: "influencer", body });
    setSending(false);
    if (error) {
      toast.error("تعذّر إرسال الرسالة");
      return;
    }
    setDraft("");
    queryClient.invalidateQueries({ queryKey: ["portal", "messages", openId] });
    queryClient.invalidateQueries({ queryKey: ["portal", "conversations"] });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!influencer) {
    return (
      <p className="mx-auto max-w-md px-4 pt-12 text-center text-sm text-muted-foreground">
        لم نعثر على ملفك في المنصة.
      </p>
    );
  }

  if (openId) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pt-6">
        <header className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenId(null)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted"
            aria-label="رجوع"
          >
            <ArrowRight className="size-5" />
          </button>
          <h1 className="text-base font-bold text-foreground">المحادثة</h1>
        </header>

        <div className="flex-1 space-y-2 pb-4">
          {messages.isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-accent" />
            </div>
          ) : (
            messages.data?.map((m) => (
              <div
                key={m.id}
                className={
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm " +
                  (m.sender === "influencer"
                    ? "ms-auto bg-accent text-accent-foreground"
                    : "me-auto bg-surface border border-border text-foreground")
                }
              >
                {m.body}
              </div>
            ))
          )}
        </div>

        <div className="sticky bottom-24 flex items-center gap-2 rounded-2xl border border-border bg-surface p-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="اكتب رسالة..."
            className="flex-1 bg-transparent px-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !draft.trim()}
            className="rounded-xl bg-accent p-2.5 text-accent-foreground disabled:opacity-50"
            aria-label="إرسال"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <h1 className="text-center text-lg font-bold text-foreground">الرسائل</h1>

      {conversations.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-accent" />
        </div>
      ) : (conversations.data?.length ?? 0) === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <MessageSquare className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">لا توجد محادثات بعد.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {conversations.data!.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setOpenId(c.id)}
                className="w-full rounded-2xl border border-border bg-surface p-4 text-start shadow-soft"
              >
                <p className="font-semibold text-foreground">{c.campaign?.name ?? "محادثة"}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {c.last_message ?? "لا توجد رسائل"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
