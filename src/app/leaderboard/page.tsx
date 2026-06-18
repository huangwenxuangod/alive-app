"use client";

import { useState } from "react";
import { LeaderboardTabs } from "@/components/leaderboard/tabs";
import { AliveTable, RevenueTable, FirstDollarTable, SurvivalTable } from "@/components/leaderboard/tables";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("alive");

  return (
    <div className="py-10">
      <h2 className="text-[28px] font-bold mb-6">排行榜</h2>
      <LeaderboardTabs active={activeTab} onChange={setActiveTab} />
      {activeTab === "alive" && <AliveTable />}
      {activeTab === "revenue" && <RevenueTable />}
      {activeTab === "first" && <FirstDollarTable />}
      {activeTab === "survival" && <SurvivalTable />}
    </div>
  );
}
