import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/campaigns")({
  component: CampaignsPage,
});

function CampaignsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background pb-28">
      <header className="mx-auto flex max-w-md items-center justify-between px-4 pt-6 pb-3">
        <h1 className="text-lg font-bold text-foreground">حملاتي</h1>
        <Link
          to="/campaign/new"
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-card hover:opacity-95"
        >
          <Plus className="size-4" />
          حملة جديدة
        </Link>
      </header>
      <main className="mx-auto max-w-md px-4">
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-sm text-muted-foreground">
            لا توجد حملات بعد. أنشئ أول حملة لك.
          </p>
          <Link
            to="/campaign/new"
            className="mt-4 inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            <Plus className="size-4" />
            إنشاء حملة
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
