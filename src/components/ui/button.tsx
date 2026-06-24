import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#00ff88] text-black hover:bg-[#00ff88]/90',
        secondary:
          'bg-[#1a1a1a] text-white hover:bg-[#222] border border-[#2a2a2a]',
        outline: 'border border-[#2a2a2a] text-white hover:bg-[#1a1a1a]',
        ghost: 'text-white hover:bg-[#1a1a1a]',
        destructive:
          'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30',
        link: 'text-[#00ff88] hover:underline underline-offset-4',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
