import type { Metadata } from "next";
import { LoginClient } from "./login-client";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `登录 - ${siteConfig.name}`,
  description: "登录 ALIVE，开始你的 30 天赚钱生存挑战。",
};

export default function LoginPage() {
  const hasGithub = !!process.env.GITHUB_CLIENT_ID;
  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <LoginClient hasGithub={hasGithub} hasGoogle={hasGoogle} />
    </div>
  );
}
