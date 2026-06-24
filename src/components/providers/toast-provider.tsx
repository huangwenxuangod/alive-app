'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-[#111] border border-[#1a1a1a] text-white',
          title: 'text-white',
          description: 'text-gray-400',
          success: 'border-green-500/30',
          error: 'border-red-500/30',
        },
      }}
    />
  );
}
