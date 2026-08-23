import Image from "next/image";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { ButtonLink } from "@/components/landing/button-link";
import { AmbientBackground } from "@/components/landing/ambient-background";
import { RevealSection } from "@/components/landing/reveal-section";
import { FadeIn } from "@/components/landing/fade-in";
import { SelfDrawUnderline } from "@/components/landing/self-draw-underline";
import { LiquidBlob } from "@/components/landing/liquid-blob";
import { RouteProgress } from "@/components/landing/route-progress";
import { PulseIcon } from "@/components/landing/pulse-icon";
import { FeaturesSection } from "@/components/landing/features-section";
import dashboardImage from "@/public/Ilustraciones_base/dashboard.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <RouteProgress />
      <Navbar />
      <main>
        <section className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-28 text-center sm:px-6 md:pb-28 md:pt-36 lg:px-10">
          <AmbientBackground />
          <FadeIn delay={0.05}>
            <h1 className="max-w-4xl text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.045em] text-black sm:text-5xl md:text-6xl">Creá tu página web<br className="hidden sm:block" /> con IA + desarrolladores <span className="relative inline-block bg-gradient-to-r from-[#191c1d] to-[#6063ee] bg-clip-text text-transparent"><SelfDrawUnderline />humanos.</span></h1>
          </FadeIn>
          <FadeIn delay={0.22}>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#4c4546] md:mt-8">Todo un equipo de profesionales disponible en tu bolsillo.</p>
          </FadeIn>
          <FadeIn delay={0.38} className="mt-10 w-full md:mt-12">
            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"><ButtonLink href="/register" variant="accent">Empezá gratis<ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1" /></ButtonLink><ButtonLink href="#demo" variant="outline">Ver video demo</ButtonLink></div>
          </FadeIn>
          <FadeIn delay={0.52} className="mt-16 w-full md:mt-20">
            <div id="demo" className="relative w-full overflow-hidden rounded-lg border border-[#e1e3e4] bg-white shadow-[0_18px_50px_-20px_rgba(15,23,42,0.18)]">
              <LiquidBlob />
              <div className="relative">
                <div className="flex h-10 items-center gap-2 border-b border-[#e1e3e4] bg-[#f3f4f5] px-4 sm:h-12"><span className="size-2.5 animate-pulse rounded-full bg-[#d9dadb]" /><span className="size-2.5 rounded-full bg-[#d9dadb]" /><span className="size-2.5 rounded-full bg-[#d9dadb]" /></div>
                <div className="bg-gradient-to-br from-[#eef1f6] via-white to-[#e7ebf2] p-4 sm:p-8 md:p-12"><Image src={dashboardImage} alt="Panel de Builto mostrando proyectos, estados y actividad reciente" className="h-auto w-full rounded-lg border border-[#dfe3ea] shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]" priority sizes="(max-width: 768px) 92vw, 1120px" /></div>
              </div>
            </div>
          </FadeIn>
        </section>
         <FeaturesSection />
        <RevealSection>
          <section id="plantillas" aria-labelledby="templates-title" className="border-y border-[#e1e3e4] bg-white px-4 py-20 sm:px-6 md:py-28"><div className="mx-auto flex max-w-4xl flex-col items-center text-center"><h2 id="templates-title" className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-black sm:text-4xl md:text-5xl">Algunas de nuestras plantillas<span className="block text-[#666768]">listas para usar hoy.</span></h2><div className="mt-12 flex flex-col items-center gap-6 text-base font-medium sm:flex-row sm:gap-8"><span className="flex items-center gap-3"><PulseIcon icon={<Sparkles className="size-6" />} className="text-[#4648d4]" />DeepSeek</span><span className="h-px w-12 bg-[#d9dadb] sm:h-10 sm:w-px" /><span className="flex items-center gap-3"><PulseIcon icon={<ShieldCheck className="size-6" />} duration={3.8} />Todas las entregas revisadas por moderadores</span></div></div></section>
        </RevealSection>
        <RevealSection>
          <section id="comenzar" className="flex flex-col items-center px-4 py-20 text-center md:py-24"><h2 className="text-2xl font-semibold tracking-[-0.025em] text-black sm:text-3xl">¿Listo para construir tu próxima idea?</h2><ButtonLink href="/register" className="mt-8 px-8 py-4">Comenzar</ButtonLink></section>
        </RevealSection>
      </main>
      <footer className="border-t border-[#e1e3e4] bg-white px-4 py-8 sm:px-6 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-xs text-[#4c4546] sm:flex-row"><p>© 2026 Builto. Todos los derechos reservados.</p><nav aria-label="Enlaces legales" className="flex gap-6"><a className="transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4" href="/terminos">Términos y condiciones</a></nav></div></footer>
    </div>
  );
}
