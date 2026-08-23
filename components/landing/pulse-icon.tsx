"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PulseIcon({ icon, className = "", duration = 3.2 }: { icon: ReactNode; className?: string; duration?: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`inline-flex ${className}`}
      animate={{ y: [0, -5, 0], rotate: [0, 6, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {icon}
    </motion.span>
  );
}
