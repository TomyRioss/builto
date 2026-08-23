import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "default" | "accent" | "outline";
};

const variants = {
  default: "border-black bg-black text-white hover:bg-[#2e3132]",
  accent: "border-[#4648d4] bg-[#4648d4] text-white hover:border-[#6063ee] hover:bg-[#6063ee]",
  outline: "border-[#d9dadb] bg-white text-black hover:border-[#b8b9ba] hover:bg-[#f3f4f5]",
};

export function ButtonLink({ children, className = "", variant = "default", ...props }: ButtonLinkProps) {
  return <a className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border px-7 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4648d4] ${variants[variant]} ${className}`} {...props}>{children}</a>;
}
