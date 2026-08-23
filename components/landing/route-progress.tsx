"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type ProgressState = { target: string | null; lastPathname: string };

export function RouteProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<ProgressState>({ target: null, lastPathname: pathname });

  if (state.lastPathname !== pathname) {
    setState({ target: null, lastPathname: pathname });
  }

  const active = state.target !== null;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || anchor.target === "_blank") return;
      if (href === pathname) return;
      setState((current) => ({ ...current, target: href }));
    }
    function handlePageShow() {
      setState((current) => (current.target === null ? current : { ...current, target: null }));
    }
    document.addEventListener("click", handleClick);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname]);

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => setState((current) => ({ ...current, target: null })), 5000);
    return () => clearTimeout(timeout);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 z-[100] h-[3px]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 0.65, 0.85] }}
            transition={{ duration: 1.6, ease: "easeOut", times: [0, 0.7, 1] }}
            style={{ transformOrigin: "left" }}
            className="h-full w-full bg-gradient-to-r from-[#4648d4] to-[#6063ee]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
