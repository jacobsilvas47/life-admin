import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-background">
      <AppSidebar />

      <section className="flex-1 px-6 py-6 md:px-10">
        {children}
      </section>
    </main>
  );
}