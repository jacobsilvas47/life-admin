"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/documents", label: "Documents" },
  { href: "/assets", label: "Assets" },
  {
    href: "/personal-records",
    label: "Personal Records",
  },
  { href: "/reminders", label: "Reminders" },
  { href: "/settings", label: "Settings" },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  async function handleLogout() {
    const supabase = createClient();

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      toast.error("Could not log out.");
      return;
    }

    setMobileOpen(false);

    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r bg-white p-6 md:flex">
        <div>
          <Link
            href="/dashboard"
            className="text-xl font-bold"
          >
            Life Admin
          </Link>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-5 md:hidden">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="text-lg font-bold"
        >
          Life Admin
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileOpen((current) => !current)
          }
          aria-label={
            mobileOpen
              ? "Close navigation"
              : "Open navigation"
          }
          className="flex size-10 items-center justify-center rounded-lg border transition hover:bg-muted"
        >
          {mobileOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
          />

          <aside className="fixed bottom-0 right-0 top-16 z-50 flex w-72 max-w-[85vw] flex-col border-l bg-white p-5 shadow-xl md:hidden">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={`block rounded-lg px-3 py-3 text-sm transition ${
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-lg px-3 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Log Out
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}