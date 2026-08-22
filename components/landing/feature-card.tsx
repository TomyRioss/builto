import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type FeatureCardProps = { title: string; description: string; icon: LucideIcon; accent?: boolean; preview: ReactNode };

export function FeatureCard({ title, description, icon: Icon, accent = false, preview }: FeatureCardProps) {
  return (
    <article className="flex min-h-[370px] flex-col rounded-lg border border-[#e1e3e4] bg-white p-6 transition-shadow hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] sm:p-8">
      <span className={`flex size-12 items-center justify-center rounded-lg ${accent ? "bg-[#eef2ff] text-[#4648d4]" : "bg-[#f0f1f2] text-black"}`}><Icon aria-hidden="true" className="size-5" strokeWidth={1.8} /></span>
      <h3 className="mt-7 text-xl font-semibold leading-7 tracking-[-0.02em] text-black">{title}</h3>
      <p className="mt-2 text-sm leading-5 text-[#4c4546]">{description}</p>
      <div className="mt-auto pt-8">{preview}</div>
    </article>
  );
}
