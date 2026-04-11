import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 cursor-pointer",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          {
            "bg-bg-inverse text-text-inverse hover:bg-neutral-800 active:bg-neutral-900": variant === "primary",
            "bg-surface text-text border border-border hover:bg-bg-subtle hover:border-border-strong": variant === "secondary",
            "text-text-secondary hover:text-text hover:bg-bg-subtle": variant === "ghost",
            "text-red hover:bg-red-subtle": variant === "danger",
            "border border-border text-text-secondary hover:text-text hover:bg-bg-subtle hover:border-border-strong": variant === "outline",
          },
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-9 px-4 text-sm": size === "md",
            "h-11 px-5 text-sm": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
