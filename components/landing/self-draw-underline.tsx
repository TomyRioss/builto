"use client";

import { motion } from "framer-motion";

export function SelfDrawUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 22"
      fill="none"
      preserveAspectRatio="none"
      className={`absolute -bottom-2 left-0 h-[0.45em] w-full ${className}`}
    >
      <motion.path
        d="M4 15 C 48 7, 92 5, 132 9 C 162 12, 192 14, 216 10"
        stroke="#6063ee"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 1.05, ease: "easeInOut" }}
      />
    </svg>
  );
}
