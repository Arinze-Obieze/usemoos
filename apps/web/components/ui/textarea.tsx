import * as React from "react";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={[
      "w-full resize-none rounded bg-surface border border-line px-3.5 py-3 text-[14.5px] text-ink placeholder:text-dim outline-none",
      "focus:border-ink focus:shadow-(--shadow-sm)",
      "[transition:border-color_0.15s,box-shadow_0.15s]",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
));
Textarea.displayName = "Textarea";
