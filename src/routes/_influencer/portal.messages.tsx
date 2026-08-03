import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, MessageCircle, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PortalShell, EmptyBox } from "@/components/PortalShell";
import { fetchMyConversations, fetchMessages, sendMessage } from "@/lib/portal";

export const Route = createFileRoute("/_influencer/portal/messages")({
  head: () => ({
    meta: [
      { title: "الرسائل — بوابة المؤثرين" },
      { name: "description", content: "تواصل مع المعلنين حول حملاتك من مكان واحد." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "الرسائل — بوابة المؤثرين" },
      { property: "og:description", content: "تواصل مع المعلنين حول حملاتك من مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  return <PortalShell title="الرسائل">{(me) => <MessagesBody influencerId={me.id} />}</PortalShell>;
}

function MessagesBody({ influencerId }: { influencerId: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal", "conversations", influencerId],
    queryFn: () => fetchMyConversations(influencerId),
  });

  if (openId) return <Thread conversationId={openId} onBack={() => setOpenId(null)} />;

  if (isLoading)
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  if (isError) return <EmptyBox message="تعذّر تحميل المحادثات، حاول التحديث." />;
  if ((data ?? []).length === 0)
    return <EmptyBox message="لا توجد محادثات بعد. تبدأ المحادثة عند تفعيل حملة معك." />;

  return (
    <ul className="flex flex-col gap-2">
      {(data ?? []).map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => setOpenId(c.id)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-start shadow-soft transition hover:bg-muted"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <MessageCircle className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-foreground">
                {c.campaign?.name ?? "محادثة"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {c.last_message ?? "لا توجد رسائل بعد"}
              </span>
            </span>
            {c.last_message_at && (
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {new Date(c.last_message_at).toLocaleDateString("ar-DZ", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Thread({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["portal", "messages", conversationId],
    queryFn: () => fetchMessages(conversationId),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      await sendMessage(conversationId, text);
      setBody("");
      await queryClient.invalidateQueries({ queryKey: ["portal", "messages", conversationId] });
    } catch {
      toast.error("تعذّر إرسال الرسالة");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 self-start text-xs font-bold text-muted-foreground"
      >
        <ArrowRight className="size-4" /> رجوع للمحادثات
      </button>

      <div className="flex min-h-[50vh] flex-col gap-2 rounded-2xl border border-border bg-surface p-3">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-accent" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <p className="py-10 text-center text-xs text-muted-foreground">ابدأ المحادثة برسالة.</p>
        ) : (
          (data ?? []).map((m) => (
            <div
              key={m.id}
              className={
                "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed " +
                (m.sender === "influencer"
                  ? "self-start bg-accent text-accent-foreground"
                  : "self-end bg-muted text-foreground")
              }
            >
              {m.body}
            </div>
          ))
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1 rounded-2xl border border-border bg-surface px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground disabled:opacity-50"
          aria-label="إرسال"
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </form>
    </div>
  );
}
