import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-text">{label}</label>}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-tertiary resize-none leading-relaxed",
          "focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent",
          "transition-shadow duration-150",
          error && "border-red focus:ring-red/20 focus:border-red",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red">{error}</p>}
      {hint && !error && <p className="text-xs text-text-tertiary">{hint}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
export { Textarea };
