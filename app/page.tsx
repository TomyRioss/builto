import Image from "next/image";
import { ArrowRight, Bot, MessageSquareText, ShieldCheck, Sparkles, UserRoundCog } from "lucide-react";
import { FeatureCard } from "@/components/landing/feature-card";
import { Navbar } from "@/components/landing/navbar";
import { ButtonLink } from "@/components/landing/button-link";
import dashboardImage from "@/public/Ilustraciones_base/dashboard.png";

const features = [
  { title: "Creá tu boceto con IA", description: "Contale a la IA qué necesitás y construí tu sitio mediante una conversación simple, sin programar.", icon: MessageSquareText, accent: true, preview: <div className="flex h-28 items-end rounded-sm border border-[#e1e3e4] bg-[#f8f9fa] p-3 sm:h-32"><p className="max-w-[190px] rounded-md border border-[#e1e3e4] bg-white p-3 text-[10px] leading-4 text-[#4c4546] shadow-sm">Creá un dashboard con métricas de ventas y una tabla de usuarios.</p></div> },
  { title: "Delegá parte a un desarrollador profesional", description: "Cuando la IA no pueda resolver algo, solicitá un desarrollador capacitado para que continúe directamente sobre tu proyecto.", icon: UserRoundCog, preview: <div className="flex h-28 flex-col justify-between rounded-sm border border-[#e1e3e4] bg-[#f8f9fa] p-3 sm:h-32"><div className="flex items-center justify-between font-mono text-[10px] text-[#4c4546]"><span>api_integration.ts</span><span className="h-2 w-2 animate-pulse rounded-full bg-[#6063ee]" /></div><span className="flex w-fit items-center gap-1.5 rounded-sm bg-[#eef2ff] px-2 py-1 text-[10px] font-medium text-[#4648d4]"><UserRoundCog aria-hidden="true" className="size-3" />Experto asignado</span></div> },
  { title: "Seguí el proyecto en tiempo real", description: "Visualizá desde tu panel cómo avanza el trabajo y mantené el control en todo momento.", icon: Bot, preview: <div className="flex h-28 flex-col justify-center gap-2.5 rounded-sm border border-[#e1e3e4] bg-[#f8f9fa] p-4 sm:h-32"><span className="h-2 w-full rounded-full bg-[#e1e3e4]" /><span className="h-2 w-5/6 rounded-full bg-[#e1e3e4]" /><span className="mt-1 h-2 w-3/5 rounded-full bg-[#c0c1ff]" /></div> },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <Navbar />
      <main>
        <section className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-28 text-center sm:px-6 md:pb-28 md:pt-36 lg:px-10">
          <h1 className="max-w-4xl text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.045em] text-black sm:text-5xl md:text-6xl">Creá tu página web<br className="hidden sm:block" /> con IA + desarrolladores <span className="bg-gradient-to-r from-[#191c1d] to-[#6063ee] bg-clip-text text-transparent">humanos.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#4c4546] md:mt-8">Todo un equipo de profesionales disponible en tu bolsillo.</p>
          <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row md:mt-12"><ButtonLink href="#comenzar" variant="accent">Empezá gratis<ArrowRight aria-hidden="true" className="size-4" /></ButtonLink><ButtonLink href="#demo" variant="outline">Ver video demo</ButtonLink></div>
          <div id="demo" className="mt-16 w-full overflow-hidden rounded-lg border border-[#e1e3e4] bg-white shadow-[0_18px_50px_-20px_rgba(15,23,42,0.18)] md:mt-20">
            <div className="flex h-10 items-center gap-2 border-b border-[#e1e3e4] bg-[#f3f4f5] px-4 sm:h-12"><span className="size-2.5 rounded-full bg-[#d9dadb]" /><span className="size-2.5 rounded-full bg-[#d9dadb]" /><span className="size-2.5 rounded-full bg-[#d9dadb]" /></div>
            <div className="bg-gradient-to-br from-[#eef1f6] via-white to-[#e7ebf2] p-4 sm:p-8 md:p-12"><Image src={dashboardImage} alt="Panel de Builto mostrando proyectos, estados y actividad reciente" className="h-auto w-full rounded-lg border border-[#dfe3ea] shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]" priority sizes="(max-width: 768px) 92vw, 1120px" /></div>
          </div>
        </section>
        <section id="caracteristicas" aria-labelledby="features-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-10"><h2 id="features-title" className="sr-only">Cómo funciona Builto</h2><div className="grid gap-5 md:grid-cols-3">{features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</div></section>
        <section id="plantillas" aria-labelledby="templates-title" className="border-y border-[#e1e3e4] bg-white px-4 py-20 sm:px-6 md:py-28"><div className="mx-auto flex max-w-4xl flex-col items-center text-center"><h2 id="templates-title" className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-black sm:text-4xl md:text-5xl">Algunas de nuestras plantillas<span className="block text-[#666768]">listas para usar hoy.</span></h2><div className="mt-12 flex flex-col items-center gap-6 text-base font-medium sm:flex-row sm:gap-8"><span className="flex items-center gap-3"><Sparkles aria-hidden="true" className="size-6 text-[#4648d4]" />DeepSeek</span><span className="h-px w-12 bg-[#d9dadb] sm:h-10 sm:w-px" /><span className="flex items-center gap-3"><ShieldCheck aria-hidden="true" className="size-6" />Todas las entregas revisadas por moderadores</span></div></div></section>
        <section id="comenzar" className="flex flex-col items-center px-4 py-20 text-center md:py-24"><h2 className="text-2xl font-semibold tracking-[-0.025em] text-black sm:text-3xl">¿Listo para construir tu próxima idea?</h2><ButtonLink href="mailto:hola@builto.com" className="mt-8 px-8 py-4">Comenzar mi proyecto</ButtonLink></section>
      </main>
      <footer className="border-t border-[#e1e3e4] bg-white px-4 py-8 sm:px-6 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-xs text-[#4c4546] sm:flex-row"><p>© 2026 Builto. Todos los derechos reservados.</p><nav aria-label="Enlaces legales" className="flex gap-6"><a className="transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4" href="#">Privacidad</a><a className="transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4" href="#">Términos</a></nav></div></footer>
    </div>
  );
}
