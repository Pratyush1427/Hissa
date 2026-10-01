"use client";

import { Camera } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Discover" },
  { href: "/back", label: "Support a stall" },
  { href: "/critics", label: "Critics" },
  { href: "/vendor", label: "For vendors" },
  { href: "/profile", label: "Me" },
];

// Desktop/tablet navigation. Phones use the bottom tab bar instead.
export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[1000] hidden border-b-2 border-line bg-surface/95 backdrop-blur md:block">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="signboard text-3xl">
          Hissa
        </Link>
        <ul className="flex flex-1 items-center gap-1">
          {links.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`rounded-full px-3 py-1.5 font-semibold ${
                    active ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href="/suggest"
          className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 font-semibold text-white shadow-sm"
        >
          <Camera className="size-4" /> Suggest a stall
        </Link>
      </nav>
    </header>
  );
}
