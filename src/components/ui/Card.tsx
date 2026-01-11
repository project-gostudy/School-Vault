import clsx from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-white rounded-2xl border border-ui-border p-6 shadow-sm",
        "transition-all duration-300 ease-out",
        onClick && "cursor-pointer hover:border-sage/50 hover:shadow-md active:scale-[0.99]",
        className
      )}
    >
      {children}
    </div>
  );
}
