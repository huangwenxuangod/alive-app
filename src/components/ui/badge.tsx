import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30',
        warning:
          'bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/30',
        danger: 'bg-[#ff4444]/10 text-[#ff4444] border border-[#ff4444]/30',
        dead: 'bg-gray-500/10 text-gray-400 border border-gray-500/30',
        secondary: 'bg-[#1a1a1a] text-gray-300 border border-[#2a2a2a]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
