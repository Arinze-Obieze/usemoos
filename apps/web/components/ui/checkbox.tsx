"use client";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={[
      "w-4 h-4 rounded-xs border-[1.5px] grid place-items-center shrink-0",
      "bg-surface border-line-2",
      "data-[state=checked]:bg-ink data-[state=checked]:border-ink",
      "[transition:background_0.15s,border-color_0.15s]",
      "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(15,17,8,0.1)]",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      {/* Custom stroke checkmark to match accent color */}
      <svg
        width="8"
        height="7"
        viewBox="0 0 8 7"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1 3.5L3 5.5L7 1.5"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
