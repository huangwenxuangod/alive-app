import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "活着 ALIVE - 30天赚钱生存挑战",
  description: "Talk is cheap. Show me your money. 30天赚钱生存挑战平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <Navbar />
        <main className="flex-1 max-w-[720px] mx-auto w-full px-5">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
