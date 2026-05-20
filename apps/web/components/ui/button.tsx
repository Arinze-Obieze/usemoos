import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "lg";
  loading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-ink text-bg shadow-(--shadow-sm) hover:bg-ink-2 hover:shadow-(--shadow-md) active:translate-y-px [transition:background_0.15s,transform_0.08s,box-shadow_0.15s]",
  outline:
    "bg-surface border border-line text-ink hover:border-line-2 hover:bg-surface-2 active:translate-y-px [transition:border-color_0.15s,background_0.15s,transform_0.08s]",
  ghost: "bg-transparent text-ink hover:bg-surface [transition:background_0.15s]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-11 px-4 text-[14px]",
  lg: "h-[46px] px-5 text-[14.5px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "default",
      size = "default",
      loading,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 font-semibold rounded disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <span className="w-[18px] h-[18px] rounded-full border-2 border-bg/30 border-t-bg animate-spin" />
      ) : (
        children
      )}
    </button>
  )
);
Button.displayName = "Button";
