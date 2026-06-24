"use client";

import { useState } from "react";
import { LeaderboardTabs, type LeaderboardTab } from "@/components/leaderboard/tabs";
import {
  AliveTable,
  RevenueTable,
  FirstDollarTable,
  SurvivalTable,
} from "@/components/leaderboard/tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LeaderboardClient() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("alive");

  return (
    <div className="py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-[28px] font-bold">排行榜</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTabs active={activeTab} onChange={setActiveTab} />
          {activeTab === "alive" && <AliveTable />}
          {activeTab === "revenue" && <RevenueTable />}
          {activeTab === "first" && <FirstDollarTable />}
          {activeTab === "survival" && <SurvivalTable />}
        </CardContent>
      </Card>
    </div>
  );
}
