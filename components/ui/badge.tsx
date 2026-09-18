import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "safe" | "warning" | "danger" | "info" | "neutral";
}

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  const variants = {
    safe: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20",
    warning: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20",
    danger: "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/20",
    info: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
