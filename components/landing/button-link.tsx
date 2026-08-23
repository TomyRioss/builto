"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> & {
  children: ReactNode;
  variant?: "default" | "accent" | "outline";
};

const variants = {
  default: "border-black bg-black text-white shadow-[0_8px_20px_-8px_rgba(15,23,42,0.5)]",
  accent: "border-[#4648d4] bg-[#4648d4] text-white shadow-[0_8px_22px_-8px_rgba(70,72,212,0.55)]",
  outline: "border-[#d9dadb] bg-white text-black shadow-[5px_5px_14px_rgba(15,23,42,0.07),-5px_-5px_14px_rgba(255,255,255,0.95)]",
};

const fills = {
  default: "bg-[#2e3132]",
  accent: "bg-[#6063ee]",
  outline: "bg-[#f3f4f5]",
};

function SelfDrawSpinner() {
  return (
    <motion.svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0.15 }}
        animate={{ pathLength: [0.15, 0.85, 0.15], rotate: 360 }}
        transition={{
          pathLength: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 1.1, repeat: Infinity, ease: "linear" },
        }}
        style={{ transformOrigin: "center" }}
      />
    </motion.svg>
  );
}

export function ButtonLink({ children, className = "", variant = "default", onClick, ...props }: ButtonLinkProps) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    function handlePageShow() {
      setPending(false);
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    if (!pending) return;
    const timeout = setTimeout(() => setPending(false), 5000);
    return () => clearTimeout(timeout);
  }, [pending]);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const modifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    const isPageNav = Boolean(props.href) && !props.href!.startsWith("#") && !props.target && !modifiedClick && props.href !== pathname;
    if (isPageNav) setPending(true);
    onClick?.(event);
  }

  return (
    <motion.a
      whileTap={{ scale: 0.96, y: 1 }}
      onClick={handleClick}
      className={`group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-sm border px-7 py-3 text-sm font-medium transition-shadow duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4648d4] hover:shadow-[0_12px_28px_-10px_rgba(15,23,42,0.35)] ${variants[variant]} ${className}`}
      {...props}
    >
      <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 top-0 origin-bottom scale-y-0 rounded-[inherit] transition-transform duration-300 ease-out group-hover:scale-y-100 ${fills[variant]}`} />
      <span className="relative z-10 inline-flex items-center gap-2">
        {pending ? <SelfDrawSpinner /> : children}
      </span>
    </motion.a>
  );
}
