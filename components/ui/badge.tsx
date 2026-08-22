import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "info" | "warning" | "success" | "neutral";
};

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "border-[#d9dadb] bg-white text-[#4c4546]",
  info: "border-[#daddff] bg-[#eef0ff] text-[#4648d4]",
  warning: "border-[#f5dfaa] bg-[#fff8e7] text-[#8a5a00]",
  success: "border-[#bde7ce] bg-[#ecf9f1] text-[#187342]",
  neutral: "border-[#e1e3e4] bg-[#f3f4f5] text-[#666768]",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn("inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium", variants[variant], className)} {...props} />;
}
