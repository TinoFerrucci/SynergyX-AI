import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

export function Card({ children, className, hover, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface shadow-card",
        hover && "transition-all duration-200 hover:shadow-card-hover hover:border-border-strong cursor-pointer",
        padding && "p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
