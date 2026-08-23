"use client";

import { motion } from "framer-motion";

const BLOB_KEYFRAMES = {
  borderRadius: [
    "58% 42% 55% 45% / 52% 56% 44% 48%",
    "45% 55% 48% 52% / 60% 42% 58% 40%",
    "52% 48% 60% 40% / 45% 58% 42% 55%",
    "58% 42% 55% 45% / 52% 56% 44% 48%",
  ],
  rotate: [0, 12, -8, 0],
};

export function LiquidBlob({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        animate={BLOB_KEYFRAMES}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-60px] top-[-30px] size-64 bg-gradient-to-br from-[#c0c1ff] via-[#eef2ff] to-[#dcdcff] opacity-50 blur-md md:size-80"
      />
      <motion.div
        animate={{
          borderRadius: [...BLOB_KEYFRAMES.borderRadius].reverse(),
          rotate: [0, -10, 8, 0],
          x: [0, -18, 10, 0],
        }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-50px] left-[-40px] size-52 bg-gradient-to-tr from-[#e7ebf2] via-white to-[#c0c1ff] opacity-40 blur-lg md:size-64"
      />
    </div>
  );
}
