"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const GENERIC_STATUS = [
  "Pensando",
  "Reflexionando",
  "Analizando tu pedido",
  "Diseñando la estructura",
  "Eligiendo colores y tipografías",
  "Revisando el código",
  "Afinando el responsive",
  "Puliendo detalles",
  "Consultando su intuición",
  "Dándole una última mirada",
];

const ROTATE_MS = 2400;

function shortenPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 2) return parts.join("/");
  return `…/${parts.slice(-2).join("/")}`;
}

export function ThinkingIndicator({ writingPath, fileExists }: { writingPath?: string | null; fileExists?: boolean }) {
  const [tick, setTick] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const interval = window.setInterval(() => setTick((current) => current + 1), ROTATE_MS);
    return () => window.clearInterval(interval);
  }, []);

  const label = writingPath
    ? `${fileExists ? "Editando" : "Programando"} ${shortenPath(writingPath)}`
    : GENERIC_STATUS[tick % GENERIC_STATUS.length];

  return (
    <span className="inline-flex min-h-6 max-w-full items-center gap-2.5 text-sm text-[#4648d4]" role="status" aria-live="polite">
      <span className="inline-flex shrink-0 items-end gap-1" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="size-2 rounded-full bg-[#6063ee]"
            animate={reducedMotion ? {} : { y: [0, -5, 0], scale: [1, 1.2, 1], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: dot * 0.15 }}
          />
        ))}
      </span>
      <span className="relative inline-flex min-w-0 overflow-hidden whitespace-nowrap">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="truncate"
          >
            {label}
            <span className="animate-pulse">…</span>
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
