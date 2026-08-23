"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

type FeatureCardProps = { title: string; description: string; icon: LucideIcon; accent?: boolean; preview: ReactNode };

export function FeatureCard({ title, description, icon: Icon, accent = false, preview }: FeatureCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover="hover"
      className="flex min-h-0 flex-col rounded-lg border border-[#eceef0] bg-white p-6 shadow-[10px_10px_26px_rgba(15,23,42,0.05),-10px_-10px_26px_rgba(255,255,255,0.95)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[14px_18px_36px_rgba(15,23,42,0.1),-8px_-8px_20px_rgba(255,255,255,0.9)] sm:min-h-[370px] sm:p-8"
    >
      <motion.span
        variants={{
          rest: { scale: 1, rotate: 0 },
          hover: { scale: [1, 1.16, 1.08], rotate: [0, -8, -4], transition: { duration: 0.45, ease: "easeOut" } },
        }}
        className={`flex size-12 items-center justify-center rounded-xl ${accent ? "bg-[#eef2ff] text-[#4648d4] shadow-[inset_2px_2px_6px_rgba(70,72,212,0.12),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]" : "bg-[#f0f1f2] text-black shadow-[inset_2px_2px_6px_rgba(15,23,42,0.08),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]"}`}
      >
        <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
      </motion.span>
      <h3 className="mt-7 text-xl font-semibold leading-7 tracking-[-0.02em] text-black">{title}</h3>
      <p className="mt-2 text-sm leading-5 text-[#4c4546]">{description}</p>
      <div className="mt-auto pt-4 sm:pt-8">{preview}</div>
    </motion.article>
  );
}
