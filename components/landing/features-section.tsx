"use client";

import { Bot, MessageSquareText, UserRoundCog } from "lucide-react";
import { FeatureCard } from "@/components/landing/feature-card";

const features = [
  { title: "Creá tu boceto con IA", description: "Contale a la IA qué necesitás y construí tu sitio mediante una conversación simple, sin programar.", icon: MessageSquareText, accent: true, preview: <div className="flex h-28 items-end rounded-sm border border-[#e1e3e4] bg-[#f8f9fa] p-3 sm:h-32"><p className="max-w-[190px] rounded-md border border-[#e1e3e4] bg-white p-3 text-[10px] leading-4 text-[#4c4546] shadow-sm">Creá un dashboard con métricas de ventas y una tabla de usuarios.</p></div> },
  { title: "Delegá parte a un desarrollador profesional", description: "Cuando la IA no pueda resolver algo, solicitá un desarrollador capacitado para que continúe directamente sobre tu proyecto.", icon: UserRoundCog, preview: <div className="flex h-28 flex-col justify-between rounded-sm border border-[#e1e3e4] bg-[#f8f9fa] p-3 sm:h-32"><div className="flex items-center justify-between font-mono text-[10px] text-[#4c4546]"><span>api_integration.ts</span><span className="h-2 w-2 animate-pulse rounded-full bg-[#6063ee]" /></div><span className="flex w-fit items-center gap-1.5 rounded-sm bg-[#eef2ff] px-2 py-1 text-[10px] font-medium text-[#4648d4]"><UserRoundCog aria-hidden="true" className="size-3" />Experto asignado</span></div> },
  { title: "Seguí el proyecto en tiempo real", description: "Visualizá desde tu panel cómo avanza el trabajo y mantené el control en todo momento.", icon: Bot, preview: <div className="flex h-28 flex-col justify-center gap-2.5 rounded-sm border border-[#e1e3e4] bg-[#f8f9fa] p-4 sm:h-32"><span className="h-2 w-full rounded-full bg-[#e1e3e4]" /><span className="h-2 w-5/6 rounded-full bg-[#e1e3e4]" /><span className="mt-1 h-2 w-3/5 rounded-full bg-[#c0c1ff]" /></div> },
];

export function FeaturesSection() {
  return (
    <section id="caracteristicas" aria-labelledby="features-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-10">
      <h2 id="features-title" className="mb-10 text-center text-2xl font-semibold tracking-[-0.02em] text-black sm:text-3xl">
        <span className="bg-gradient-to-r from-[#191c1d] to-[#6063ee] bg-clip-text text-transparent">3 Pasos</span>
      </h2>
      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
      </div>
    </section>
  );
}
