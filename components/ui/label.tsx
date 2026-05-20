"use client";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={["text-[13px] font-medium text-ink-2", className]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;
