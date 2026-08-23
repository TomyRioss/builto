"use client";

import { Bot, MessageSquareText, UserRoundCog } from "lucide-react";
import { FeatureCard } from "@/components/landing/feature-card";
import { ZoomablePreview } from "@/components/landing/zoomable-preview";

const features = [
  { title: "Creá tu boceto con IA", description: "Contale a la IA qué necesitás y construí tu sitio mediante una conversación simple, sin programar.", icon: MessageSquareText, accent: true, preview: <ZoomablePreview src="/landing/pasos/paso-1.png" alt="Chat con IA generando tu sitio" /> },
  { title: "Delegá parte a un desarrollador profesional", description: "Cuando la IA no pueda resolver algo, solicitá un desarrollador capacitado para que continúe directamente sobre tu proyecto.", icon: UserRoundCog, preview: <ZoomablePreview src="/landing/pasos/paso-3.png" alt="Solicitud de ticket a un desarrollador" /> },
  { title: "Seguí el proyecto en tiempo real", description: "Visualizá desde tu panel cómo avanza el trabajo y mantené el control en todo momento.", icon: Bot, preview: <ZoomablePreview src="/landing/pasos/paso-2.png" alt="Seguimiento de estado del proyecto" /> },
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
