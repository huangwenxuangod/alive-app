"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/challenge", label: "挑战" },
  { href: "/leaderboard", label: "排行榜" },
  { href: "/graveyard", label: "墓地" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("已退出登录");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("退出登录失败");
      console.error("Sign out error:", error);
    }
  };

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

      <div className="flex items-center gap-2">
        {isPending ? (
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-[#1a1a1a]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-sm font-medium text-[#00ff88]">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span className="text-sm text-gray-300 hidden sm:inline">
                {user.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white"
            >
              退出
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                登录
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">注册</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
