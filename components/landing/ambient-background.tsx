"use client";

import { motion } from "framer-motion";

const PARTICLES = [
  { left: "8%", size: 5, duration: 18, delay: 0, opacity: 0.35 },
  { left: "18%", size: 3, duration: 24, delay: 4, opacity: 0.25 },
  { left: "31%", size: 4, duration: 21, delay: 9, opacity: 0.3 },
  { left: "46%", size: 6, duration: 26, delay: 2, opacity: 0.2 },
  { left: "58%", size: 3, duration: 19, delay: 12, opacity: 0.35 },
  { left: "69%", size: 5, duration: 23, delay: 6, opacity: 0.25 },
  { left: "79%", size: 4, duration: 27, delay: 15, opacity: 0.3 },
  { left: "90%", size: 6, duration: 20, delay: 10, opacity: 0.22 },
];

export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 top-[-120px] size-[420px] rounded-full bg-[#c0c1ff] opacity-25 blur-[110px]"
      />
      <motion.div
        animate={{ x: [0, -30, 25, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-140px] top-[80px] size-[380px] rounded-full bg-[#eef2ff] opacity-40 blur-[100px]"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 0.95, 1], x: [0, 20, -25, 0], y: [0, -18, 12, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-160px] left-1/2 size-[340px] rounded-full bg-[#dcdcff] opacity-30 blur-[120px]"
      />
      {PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          initial={{ y: "105vh", x: 0 }}
          animate={{
            y: "-6vh",
            x: index % 2 === 0 ? 26 : -26,
            opacity: [particle.opacity, particle.opacity * 0.4, particle.opacity],
          }}
          transition={{
            y: { duration: particle.duration, repeat: Infinity, ease: "linear", delay: particle.delay },
            x: { duration: particle.duration / 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
            opacity: { duration: particle.duration / 2, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ left: particle.left, width: particle.size, height: particle.size }}
          className="absolute top-0 rounded-full bg-[#6063ee]"
        />
      ))}
    </div>
  );
}
