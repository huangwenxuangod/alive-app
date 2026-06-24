import { cn } from "@/lib/utils";

interface UserCellProps {
  name: string;
  gradient: string;
  className?: string;
}

export function UserCell({ name, gradient, className }: UserCellProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br", gradient)} />
      <span className="font-semibold text-sm">{name}</span>
    </div>
  );
}
