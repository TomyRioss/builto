import { makeTemplateIndexHtml } from "./shared";

const expeditions = [
  ["Kioto & Los Alpes Japoneses", "Japón", "12 días", "$6.800 USD", "Misticismo milenario, templos zen y ryokans privados."],
  ["Patagonia & Glaciares Prístinos", "Argentina", "10 días", "$5.400 USD", "Silencio austral, estancias privadas y naturaleza sin prisa."],
  ["Serengeti & Ngorongoro", "África", "9 días", "$8.900 USD", "Fauna, paisajes vastos y campamentos de autor."],
  ["Dolomitas & Costa Amalfitana", "Italia", "11 días", "$7.200 USD", "Arquitectura, gastronomía y rutas mediterráneas."],
  ["Noruega: Fiordos & Luces del Norte", "Europa", "8 días", "$6.100 USD", "Fiordos remotos y cielos polares."],
  ["Capadocia & Costa Turquesa", "Turquía", "10 días", "$5.900 USD", "Historia, cielos abiertos y hoteles excavados en piedra."],
];

export const VIAJES_SEED: Record<string, string> = {
  "/index.html": makeTemplateIndexHtml({
    title: "AURA Travel Studio",
    fontLinks: [
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap",
    ],
  }),
  "/tailwind.config.js": `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { fontFamily: { display: ["Playfair Display", "serif"], cinzel: ["Cinzel", "serif"] } } },
  plugins: [],
};
`,
  "/src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

html { scroll-behavior: smooth; }
body { background: #0a0a0a; }
`,
  "/src/App.tsx": `const expeditions = ${JSON.stringify(expeditions)} as const;

export default function App() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] font-sans text-[#f2f2f2]">
      <header className="border-b border-white/10 px-5 py-5 md:px-12"><div className="mx-auto flex max-w-7xl items-center justify-between"><a href="#inicio" className="font-cinzel text-xl tracking-[0.25em] text-[#d4af37]">AURA</a><span className="hidden text-xs uppercase tracking-[0.25em] text-white/50 md:block">Travel Studio</span><a href="#contacto" className="border border-[#d4af37] px-4 py-2 text-xs uppercase tracking-widest text-[#d4af37]">Diseña tu viaje</a></div></header>
      <section id="inicio" className="relative isolate overflow-hidden px-5 py-32 md:px-12 md:py-48"><div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,10,.9),rgba(10,10,10,.35)),url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1800&auto=format&fit=crop')] bg-cover bg-center" /><div className="mx-auto max-w-7xl"><p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Expediciones de autor · 2025 — 2026</p><h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.05] md:text-8xl">Diseña tu viaje a medida.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-white/65">Rutas globales diseñadas para quienes buscan viajar más lento, más profundo y con absoluta libertad.</p><a href="#rutas" className="mt-9 inline-block bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black">Explorar rutas</a></div></section>
      <section id="rutas" className="mx-auto max-w-7xl px-5 py-24 md:px-12"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Curaduría de expediciones</p><h2 className="mt-4 font-display text-5xl">Rutas de autor</h2></div><span className="text-sm text-white/50">Región del mundo · Todos los continentes</span></div><div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">{expeditions.map(([name, country, days, price, detail]) => <article key={name} className="bg-[#121212] p-7 transition-colors hover:bg-[#1a1a1a]"><p className="text-xs uppercase tracking-widest text-[#d4af37]">{country}</p><h3 className="mt-8 min-h-16 font-display text-2xl">{name}</h3><p className="mt-4 min-h-14 text-sm leading-6 text-white/55">{detail}</p><div className="mt-8 flex justify-between border-t border-white/10 pt-4 text-xs uppercase tracking-widest"><span>{days}</span><strong className="text-[#d4af37]">{price}</strong></div><button type="button" className="mt-7 text-sm text-[#edd88b]">Ver itinerario completo →</button></article>)}</div></section>
      <section className="border-y border-white/10 bg-[#121212] px-5 py-24 md:px-12"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2"><div><p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">El manifiesto AURA</p><h2 className="mt-5 font-display text-5xl leading-tight">El lujo es tener tiempo para mirar.</h2></div><blockquote className="border-l border-[#d4af37] pl-7 text-xl leading-9 text-white/70">“No coleccionamos destinos. Diseñamos momentos de silencio, belleza y asombro que permanecen mucho después del regreso.”<footer className="mt-6 text-xs uppercase tracking-widest text-[#d4af37]">Martín de la Riva · Director creativo</footer></blockquote></div></section>
      <section id="contacto" className="mx-auto max-w-7xl px-5 py-24 md:px-12"><div className="grid gap-12 md:grid-cols-2"><div><p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Reserva & diseño confidencial</p><h2 className="mt-5 font-display text-5xl">Tu próxima historia empieza acá.</h2><p className="mt-6 leading-7 text-white/55">Un diseñador de viajes senior estructurará tu dossier detallado sin compromiso comercial.</p></div><form className="space-y-4"><input placeholder="Nombre y apellido *" className="w-full border border-white/15 bg-transparent p-4 text-sm" /><input placeholder="Correo electrónico *" type="email" className="w-full border border-white/15 bg-transparent p-4 text-sm" /><textarea placeholder="Preferencias de viaje" rows={4} className="w-full border border-white/15 bg-transparent p-4 text-sm" /><button type="button" className="w-full bg-[#d4af37] p-4 text-sm font-semibold uppercase tracking-widest text-black">Enviar solicitud a concierge</button></form></div></section>
      <footer className="border-t border-white/10 px-5 py-12 text-center text-xs uppercase tracking-widest text-white/40 md:px-12"><span className="font-cinzel text-[#d4af37]">AURA</span><span className="mx-3">·</span> Atención 24/7 · concierge@auratravelstudio.com</footer>
    </main>
  );
}
`,
};
