import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Scan / Upload" },
  { href: "/assets", label: "Assets" },
  { href: "/reminders", label: "Reminders" },
  { href: "/settings", label: "Settings" },
];

export function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-muted/20 px-4 py-6 md:block">
      <Link href="/" className="text-xl font-bold">
        Life Admin
      </Link>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}