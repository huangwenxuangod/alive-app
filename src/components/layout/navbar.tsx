"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/challenge", label: "挑战" },
  { href: "/leaderboard", label: "排行榜" },
  { href: "/graveyard", label: "墓地" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between py-4 px-8 w-full max-w-[1200px] mx-auto">
      <Link href="/" className="text-xl font-extrabold tracking-tight">
        活着 <span className="text-[#666] font-normal text-sm ml-1">ALIVE</span>
      </Link>
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm transition-colors",
              pathname === link.href
                ? "text-white bg-[#111]"
                : "text-[#888] hover:text-white"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
