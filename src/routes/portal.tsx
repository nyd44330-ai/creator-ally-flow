import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PortalNav } from "@/components/PortalNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/portal")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/influencer-login" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "بوابة المؤثرين" },
      { name: "description", content: "لوحة تحكم المؤثر: العروض، الأرباح، الرسائل والملف الشخصي." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <div dir="rtl" className="min-h-screen bg-background pb-28">
      <Outlet />
      <PortalNav />
    </div>
  );
}
