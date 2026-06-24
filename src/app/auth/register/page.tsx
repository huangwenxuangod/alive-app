import type { Metadata } from "next";
import { RegisterClient } from "./register-client";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `注册 - ${siteConfig.name}`,
  description: "注册 ALIVE，开启你的 30 天赚钱生存挑战。",
};

export default function RegisterPage() {
  const hasGithub = !!process.env.GITHUB_CLIENT_ID;
  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <RegisterClient hasGithub={hasGithub} hasGoogle={hasGoogle} />
    </div>
  );
}
