import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { createAuthServerClient } from "@/lib/supabase-auth-server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen bg-gray-50">
      <AppSidebar />

      <section className="min-w-0 flex-1 px-4 pb-6 pt-20 sm:px-6 md:px-10 md:py-6">
        {children}
      </section>
    </main>
  );
}