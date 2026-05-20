import * as React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={[
      "h-11 w-full px-3.5 bg-surface border border-line rounded text-[14.5px] text-ink placeholder:text-muted outline-none",
      "focus:border-ink focus:shadow-[0_0_0_4px_rgba(15,17,8,0.06)]",
      "[transition:border-color_0.15s,box-shadow_0.15s]",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
));
Input.displayName = "Input";
