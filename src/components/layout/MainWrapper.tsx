import clsx from 'clsx';
import type { ReactNode } from 'react';

interface MainWrapperProps {
  children: ReactNode;
  className?: string;
}

export function MainWrapper({ children, className }: MainWrapperProps) {
  return (
    <main className={clsx("min-h-screen w-full flex flex-col items-center py-12 px-6 sm:px-12", className)}>
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
        {children}
      </div>
    </main>
  );
}
