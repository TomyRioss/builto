import { Menu } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const navLinks = [{ label: "Características", href: "#caracteristicas" }, { label: "Plantillas", href: "#plantillas" }, { label: "Demo", href: "#demo" }];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e1e3e4] bg-[#f8f9fa]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <a href="#" aria-label="Builto, inicio" className="text-2xl font-bold tracking-[-0.04em] text-black focus-visible:outline-2 focus-visible:outline-offset-4">Builto</a>
        <nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => <a key={link.href} href={link.href} className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4c4546] transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4">{link.label}</a>)}
          <span className="h-4 w-px bg-[#d9dadb]" />
          <a href="#comenzar" className="text-xs font-semibold uppercase tracking-[0.12em] text-black focus-visible:outline-2 focus-visible:outline-offset-4">Ingresar</a>
          <ButtonLink href="#comenzar" className="min-h-10 px-5 py-2 text-xs">Comenzar</ButtonLink>
        </nav>
        <details className="group relative md:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-sm border border-[#d9dadb] bg-white text-black focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden"><span className="sr-only">Abrir menú</span><Menu aria-hidden="true" className="size-5" /></summary>
          <nav aria-label="Navegación móvil" className="absolute right-0 top-12 flex w-64 flex-col gap-1 rounded-lg border border-[#e1e3e4] bg-white p-3 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12)]">
            {navLinks.map((link) => <a key={link.href} href={link.href} className="rounded-sm px-4 py-3 text-sm font-medium text-[#4c4546] hover:bg-[#f3f4f5] hover:text-black">{link.label}</a>)}
            <ButtonLink href="#comenzar" className="mt-2">Comenzar</ButtonLink>
          </nav>
        </details>
      </div>
    </header>
  );
}
