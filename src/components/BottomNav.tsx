"use client";

import { Camera, Compass, HeartHandshake, Trophy, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Discover", Icon: Compass },
  { href: "/back", label: "Support", Icon: HeartHandshake },
  { href: "/suggest", label: "Suggest", Icon: Camera, primary: true },
  { href: "/critics", label: "Critics", Icon: Trophy },
  { href: "/profile", label: "Me", Icon: UserRound },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t-2 border-line bg-surface/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-end justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {tabs.map(({ href, label, Icon, primary }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          if (primary) {
            return (
              <li key={href}>
                <Link href={href} className="-mt-7 flex flex-col items-center gap-1 text-xs font-semibold text-brand">
                  <span className="grid size-14 place-items-center rounded-full border-4 border-background bg-brand text-white shadow-lg">
                    <Icon className="size-6" strokeWidth={2.2} />
                  </span>
                  {label}
                </Link>
              </li>
            );
          }
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 px-2 text-xs font-semibold ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <Icon className="size-6" strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
