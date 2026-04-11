import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "green" | "orange" | "red" | "blue" | "violet" | "amber" | "cyan";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const styles: Record<BadgeVariant, string> = {
  default: "bg-bg-muted text-text-secondary",
  accent: "bg-accent-subtle text-accent-text",
  green: "bg-green-subtle text-green",
  orange: "bg-orange-subtle text-orange",
  red: "bg-red-subtle text-red",
  blue: "bg-blue-subtle text-blue",
  violet: "bg-violet-subtle text-violet",
  amber: "bg-amber-subtle text-amber",
  cyan: "bg-cyan-subtle text-cyan",
};

export function Badge({ children, variant = "default", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium leading-relaxed whitespace-nowrap",
        styles[variant],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />}
      {children}
    </span>
  );
}
