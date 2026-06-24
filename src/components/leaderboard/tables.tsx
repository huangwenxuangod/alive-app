"use client";

import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { UserCell } from "@/components/leaderboard/user-cell";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────

type ChallengeStatus = "alive" | "warning" | "danger";

interface AliveRow {
  rank: number;
  name: string;
  target: number;
  current: number;
  daysLeft: number;
  status: ChallengeStatus;
  gradient: string;
}

interface RevenueRow {
  rank: number;
  name: string;
  total: number;
  times: number;
  rate: string;
  gradient: string;
}

interface FirstDollarRow {
  rank: number;
  name: string;
  day: string;
  target: number;
  gradient: string;
}

interface SurvivalRow {
  rank: number;
  name: string;
  longest: string;
  total: string;
  gradient: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────

const aliveData: AliveRow[] = [
  { rank: 1, name: "黄文轩", target: 100, current: 89, daysLeft: 12, status: "alive", gradient: "from-[#667eea] to-[#764ba2]" },
  { rank: 2, name: "小林", target: 1000, current: 756, daysLeft: 5, status: "alive", gradient: "from-[#f093fb] to-[#f5576c]" },
  { rank: 3, name: "Alex", target: 100, current: 67, daysLeft: 18, status: "alive", gradient: "from-[#4facfe] to-[#00f2fe]" },
  { rank: 4, name: "Sarah", target: 10, current: 8, daysLeft: 20, status: "warning", gradient: "from-[#43e97b] to-[#38f9d7]" },
  { rank: 5, name: "Mike", target: 1000, current: 234, daysLeft: 3, status: "danger", gradient: "from-[#fa709a] to-[#fee140]" },
];

const revenueData: RevenueRow[] = [
  { rank: 1, name: "小林", total: 2340, times: 5, rate: "80%", gradient: "from-[#f093fb] to-[#f5576c]" },
  { rank: 2, name: "黄文轩", total: 1567, times: 8, rate: "75%", gradient: "from-[#667eea] to-[#764ba2]" },
  { rank: 3, name: "Mike", total: 890, times: 3, rate: "33%", gradient: "from-[#fa709a] to-[#fee140]" },
];

const firstDollarData: FirstDollarRow[] = [
  { rank: 1, name: "Alex", day: "Day 1", target: 10, gradient: "from-[#4facfe] to-[#00f2fe]" },
  { rank: 2, name: "黄文轩", day: "Day 3", target: 100, gradient: "from-[#667eea] to-[#764ba2]" },
  { rank: 3, name: "小林", day: "Day 5", target: 1000, gradient: "from-[#f093fb] to-[#f5576c]" },
];

const survivalData: SurvivalRow[] = [
  { rank: 1, name: "黄文轩", longest: "45天", total: "120天", gradient: "from-[#667eea] to-[#764ba2]" },
  { rank: 2, name: "Sarah", longest: "38天", total: "95天", gradient: "from-[#43e97b] to-[#38f9d7]" },
  { rank: 3, name: "小林", longest: "30天", total: "87天", gradient: "from-[#f093fb] to-[#f5576c]" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

const rankColors: Record<number, string> = {
  1: "text-[#ffd700]",
  2: "text-[#c0c0c0]",
  3: "text-[#cd7f32]",
};

function statusLabel(status: ChallengeStatus): string {
  switch (status) {
    case "alive":
      return "活着";
    case "warning":
      return "危险";
    case "danger":
      return "濒死";
  }
}

function statusVariant(status: ChallengeStatus): "default" | "warning" | "danger" {
  switch (status) {
    case "alive":
      return "default";
    case "warning":
      return "warning";
    case "danger":
      return "danger";
  }
}

// ─── Alive Table ──────────────────────────────────────────────────────────

const aliveColumns: Column<AliveRow>[] = [
  {
    key: "rank",
    header: "排名",
    width: "50px",
    cell: (row) => (
      <span className={cn("font-bold", rankColors[row.rank] || "text-[#666]")}>
        {row.rank}
      </span>
    ),
  },
  {
    key: "user",
    header: "用户",
    width: "1fr",
    cell: (row) => <UserCell name={row.name} gradient={row.gradient} />,
  },
  {
    key: "target",
    header: "目标",
    width: "80px",
    cell: (row) => `$${row.target}`,
  },
  {
    key: "current",
    header: "收入",
    width: "80px",
    cell: (row) => <span className="text-[#00ff88] font-semibold">${row.current}</span>,
  },
  {
    key: "daysLeft",
    header: "剩余",
    width: "80px",
    cell: (row) => `${row.daysLeft}天`,
  },
  {
    key: "status",
    header: "状态",
    width: "80px",
    cell: (row) => <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>,
  },
];

export function AliveTable() {
  return (
    <DataTable<AliveRow>
      columns={aliveColumns}
      data={aliveData}
      getRowKey={(row) => row.rank}
      gridCols="50px 1fr 80px 80px 80px 80px"
    />
  );
}

// ─── Revenue Table ────────────────────────────────────────────────────────

const revenueColumns: Column<RevenueRow>[] = [
  {
    key: "rank",
    header: "排名",
    width: "50px",
    cell: (row) => (
      <span className={cn("font-bold", rankColors[row.rank] || "text-[#666]")}>
        {row.rank}
      </span>
    ),
  },
  {
    key: "user",
    header: "用户",
    width: "1fr",
    cell: (row) => <UserCell name={row.name} gradient={row.gradient} />,
  },
  {
    key: "total",
    header: "总收入",
    width: "100px",
    cell: (row) => <span className="text-[#00ff88] font-semibold">${row.total}</span>,
  },
  {
    key: "times",
    header: "次数",
    width: "80px",
    cell: (row) => `${row.times}次`,
  },
  {
    key: "rate",
    header: "存活率",
    width: "80px",
    accessorKey: "rate",
  },
];

export function RevenueTable() {
  return (
    <DataTable<RevenueRow>
      columns={revenueColumns}
      data={revenueData}
      getRowKey={(row) => row.rank}
      gridCols="50px 1fr 100px 80px 80px"
    />
  );
}

// ─── First Dollar Table ───────────────────────────────────────────────────

const firstDollarColumns: Column<FirstDollarRow>[] = [
  {
    key: "rank",
    header: "排名",
    width: "50px",
    cell: (row) => (
      <span className={cn("font-bold", rankColors[row.rank] || "text-[#666]")}>
        {row.rank}
      </span>
    ),
  },
  {
    key: "user",
    header: "用户",
    width: "1fr",
    cell: (row) => <UserCell name={row.name} gradient={row.gradient} />,
  },
  {
    key: "day",
    header: "用时",
    width: "100px",
    cell: (row) => <span className="text-[#00ff88] font-semibold">{row.day}</span>,
  },
  {
    key: "target",
    header: "目标",
    width: "80px",
    cell: (row) => `$${row.target}`,
  },
];

export function FirstDollarTable() {
  return (
    <DataTable<FirstDollarRow>
      columns={firstDollarColumns}
      data={firstDollarData}
      getRowKey={(row) => row.rank}
      gridCols="50px 1fr 100px 80px"
    />
  );
}

// ─── Survival Table ───────────────────────────────────────────────────────

const survivalColumns: Column<SurvivalRow>[] = [
  {
    key: "rank",
    header: "排名",
    width: "50px",
    cell: (row) => (
      <span className={cn("font-bold", rankColors[row.rank] || "text-[#666]")}>
        {row.rank}
      </span>
    ),
  },
  {
    key: "user",
    header: "用户",
    width: "1fr",
    cell: (row) => <UserCell name={row.name} gradient={row.gradient} />,
  },
  {
    key: "longest",
    header: "最长存活",
    width: "100px",
    cell: (row) => <span className="text-[#00ff88] font-semibold">{row.longest}</span>,
  },
  {
    key: "total",
    header: "总存活",
    width: "100px",
    accessorKey: "total",
  },
];

export function SurvivalTable() {
  return (
    <DataTable<SurvivalRow>
      columns={survivalColumns}
      data={survivalData}
      getRowKey={(row) => row.rank}
      gridCols="50px 1fr 100px 100px"
    />
  );
}
