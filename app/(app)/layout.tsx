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

      <section className="flex-1 px-6 py-6 md:px-10">
        {children}
      </section>
    </main>
  );
}