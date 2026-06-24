"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface Column<TData> {
  key: string;
  header: string;
  width?: string;
  cell?: (row: TData) => React.ReactNode;
  accessorKey?: keyof TData;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<TData> {
  columns: Column<TData>[];
  data: TData[];
  getRowKey: (row: TData, index: number) => string | number;
  gridCols?: string;
  className?: string;
  rowClassName?: string;
}

function DataTableInner<TData>({
  columns,
  data,
  getRowKey,
  gridCols,
  className,
  rowClassName,
}: DataTableProps<TData>) {
  // Build CSS grid template columns from column widths
  const defaultGridCols = columns
    .map((col) => col.width || "1fr")
    .join(" ");
  const cols = gridCols || defaultGridCols;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div
        className={cn(
          "grid gap-2 px-4 py-2 text-xs text-[#666] uppercase tracking-wider border-b border-[#1a1a1a]"
        )}
        style={{ gridTemplateColumns: cols }}
      >
        {columns.map((col) => (
          <span key={col.key} className={col.headerClassName}>
            {col.header}
          </span>
        ))}
      </div>

      {/* Rows */}
      {data.map((row, index) => (
        <div
          key={getRowKey(row, index)}
          className={cn(
            "grid gap-2 items-center px-4 py-3 bg-[#111] rounded-xl text-sm",
            rowClassName
          )}
          style={{ gridTemplateColumns: cols }}
        >
          {columns.map((col) => {
            const cellContent = col.cell
              ? col.cell(row)
              : col.accessorKey
                ? (row[col.accessorKey] as React.ReactNode)
                : null;
            return (
              <div key={col.key} className={col.className}>
                {cellContent}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Export with a display name for dev tools
export const DataTable = DataTableInner as typeof DataTableInner & {
  displayName?: string;
};
DataTable.displayName = "DataTable";
