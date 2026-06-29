import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/messages")({
  component: () => (
    <div dir="rtl" className="min-h-screen bg-background pb-24">
      <header className="mx-auto max-w-md px-4 pt-6 pb-3">
        <h1 className="text-lg font-bold text-foreground text-center">رسائلي</h1>
      </header>
      <main className="mx-auto max-w-md px-4 text-center text-muted-foreground">
        قريباً
      </main>
      <BottomNav />
    </div>
  ),
});
