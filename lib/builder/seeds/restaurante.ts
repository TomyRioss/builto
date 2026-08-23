import { makeTemplateIndexHtml } from "./shared";

export const RESTAURANTE_SEED: Record<string, string> = {
  "/index.html": makeTemplateIndexHtml({
    title: "ORIGEN — Fuego & Raíz",
    fontLinks: [
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap",
    ],
  }),
  "/tailwind.config.js": `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        origin: {
          ink: "#1A1A1A",
          green: "#2D4F3C",
          cream: "#F5F5F0",
          sage: "#E3EBD3",
          muted: "#5A605B",
          line: "#D9D9D0",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
`,
  "/src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

html { scroll-behavior: smooth; }
body { background: #F5F5F0; }
`,
  "/src/App.tsx": `const dishes = [
  { name: "Ojo de Bife Madurado 45 Días", detail: "Quebracho blanco, manteca de hierbas ahumadas y papas andinas", price: "$34.000" },
  { name: "Pulpo del Atlántico a la Llama", detail: "Boniato al cardamomo, panceta artesanal y pimentón de Cachi", price: "$26.500" },
  { name: "Burrata de Granja & Higos Asados", detail: "Miel de caña, nueces pecanas y rúcula silvestre", price: "$19.800" },
];

const pillars = [
  ["Pilar I — Técnica", "El dominio del fuego y el barro", "Cocción lenta a 65°C y sellado a 400°C."],
  ["Pilar II — Origen", "Huerta propia & cosecha diaria", "100% agroecológico y trazabilidad clara."],
  ["Pilar III — Maridaje", "Cava subterránea con 180+ joyas", "Menú degustación con maridaje copa a copa."],
  ["Pilar IV — Hospitalidad", "Cocina abierta y mesa del chef", "Solo 8 lugares por servicio en la barra."],
];

export default function App() {
  return (
    <main className="min-h-screen bg-origin-cream text-origin-ink">
      <header className="sticky top-0 z-20 border-b border-origin-line/80 bg-origin-cream/95 px-5 py-4 backdrop-blur md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <a href="#inicio" className="font-serif text-2xl font-semibold tracking-tight text-origin-green">ORIGEN</a>
          <nav className="hidden gap-6 text-xs font-semibold uppercase tracking-[0.12em] text-origin-muted lg:flex">
            <a href="#experiencia">La experiencia</a><a href="#carta">La carta</a><a href="#espacios">Espacios & cava</a><a href="#contacto">Contacto</a>
          </nav>
          <a href="#reserva" className="rounded-full bg-origin-green px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">Reservar mesa</a>
        </div>
      </header>

      <section id="inicio" className="relative isolate overflow-hidden bg-origin-green px-5 py-28 text-white md:px-12 md:py-40">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(20,35,25,.98),rgba(45,79,60,.68),rgba(0,0,0,.25)),url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-origin-sage">Recoleta, Buenos Aires · Guía Michelin 2025</p>
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight md:text-7xl">El arte del fuego criollo y la cosecha noble de estación.</h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-white/75">Una experiencia de cocina de autor, brasas nobles y hospitalidad argentina.</p>
          <div className="mt-9 flex flex-wrap gap-3"><a href="#reserva" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-origin-green">Reservar mesa</a><a href="#carta" className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold">Ver carta de temporada</a></div>
        </div>
      </section>

      <section className="grid border-b border-origin-line bg-white sm:grid-cols-2 lg:grid-cols-4">
        {["4.9 / 5.0|+1.450 reseñas Google", "Fuego & horno|Quebracho & espinillo", "180+ etiquetas|Cava y sommelier", "Sin TACC & huerto|Cocina certificada"].map((item) => { const [a, b] = item.split("|"); return <div key={a} className="border-b border-origin-line p-6 last:border-0 sm:border-r lg:border-b-0"><strong className="block font-serif text-2xl text-origin-green">{a}</strong><span className="text-sm text-origin-muted">{b}</span></div>; })}
      </section>

      <section id="experiencia" className="mx-auto max-w-7xl px-5 py-24 md:px-12"><p className="text-xs font-bold uppercase tracking-[0.2em] text-origin-green">Nuestra filosofía culinaria</p><h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-6xl">Cuatro pilares donde el respeto al ingrediente es ley.</h2><div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-origin-line bg-origin-line md:grid-cols-2">{pillars.map(([eyebrow, title, detail]) => <article key={eyebrow} className="bg-origin-cream p-8 md:p-10"><p className="text-xs font-bold uppercase tracking-widest text-origin-green">{eyebrow}</p><h3 className="mt-8 font-serif text-2xl">{title}</h3><p className="mt-3 text-origin-muted">{detail}</p></article>)}</div></section>

      <section id="carta" className="bg-origin-green px-5 py-24 text-white md:px-12"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-origin-sage">Carta de otoño / invierno 2025</p><h2 className="mt-3 font-serif text-5xl">Platos al calor de las brasas.</h2></div><a href="#reserva" className="rounded-full bg-origin-sage px-5 py-3 text-sm font-bold text-origin-green">Reservar mesa</a></div><div className="mt-12 grid gap-4 md:grid-cols-3">{dishes.map((dish) => <article key={dish.name} className="rounded-xl border border-white/15 bg-white/5 p-6"><span className="text-xs font-bold uppercase tracking-widest text-origin-sage">Plato insignia</span><h3 className="mt-8 font-serif text-2xl">{dish.name}</h3><p className="mt-3 min-h-14 text-sm leading-6 text-white/65">{dish.detail}</p><p className="mt-8 border-t border-white/15 pt-4 text-lg font-semibold">{dish.price}</p></article>)}</div></div></section>

      <section id="reserva" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-[1fr_1.1fr] md:px-12"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-origin-green">Sistema de reservas en vivo</p><h2 className="mt-4 font-serif text-5xl">Asegurá tu mesa en ORIGEN.</h2><p className="mt-5 max-w-md leading-7 text-origin-muted">Elegí fecha, cantidad de personas y horario. Nuestro equipo confirma tu reserva por WhatsApp.</p></div><form className="rounded-2xl bg-white p-6 shadow-sm md:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Fecha<input type="date" className="mt-2 w-full rounded-lg border-origin-line bg-origin-cream p-3" /></label><label className="text-sm font-semibold">Personas<select className="mt-2 w-full rounded-lg border-origin-line bg-origin-cream p-3"><option>2 comensales</option><option>4 comensales</option><option>6 comensales</option></select></label><label className="text-sm font-semibold sm:col-span-2">Turno<select className="mt-2 w-full rounded-lg border-origin-line bg-origin-cream p-3"><option>20:30 hs</option><option>21:00 hs</option><option>21:30 hs</option></select></label></div><button type="button" className="mt-6 w-full rounded-lg bg-origin-green p-3 font-bold text-white">Buscar mesa</button></form></section>

      <section id="espacios" className="border-t border-origin-line px-5 py-24 md:px-12"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-origin-green">Arquitectura & atmósferas</p><div className="mt-4 grid gap-10 md:grid-cols-2"><h2 className="font-serif text-5xl">Cada rincón cuenta una historia distinta.</h2><p className="leading-7 text-origin-muted">Maderas recuperadas, cuero patagónico, ladrillo a la vista y vegetación viva crean una experiencia íntima en el corazón de Recoleta.</p></div></div></section>

      <footer id="contacto" className="bg-[#1C2820] px-5 py-16 text-white md:px-12"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3"><div><div className="font-serif text-3xl text-origin-sage">ORIGEN</div><p className="mt-3 text-sm text-white/60">Fuego & raíz · Recoleta</p></div><div className="text-sm leading-7 text-white/70"><p>Av. Quintana 450, Buenos Aires</p><p>Martes a sábados · 19:30 a 00:30 hs</p><p>reservas@origenrestaurante.com</p></div><div className="text-sm text-white/70"><p className="font-bold text-white">Seguinos</p><p className="mt-2">La experiencia gastronómica</p><p>La carta de temporada</p><p>Eventos privados & cava</p></div></div></footer>
    </main>
  );
}
`,
};
