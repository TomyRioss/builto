"use client";

import { LayoutTemplate, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

export function ClientActions() {
  const [message, setMessage] = useState("");

  function announce(action: "project" | "templates") {
    setMessage(action === "project" ? "El creador de proyectos estará disponible próximamente." : "La biblioteca de plantillas estará disponible próximamente.");
  }

  return (
    <section id="actions" aria-labelledby="actions-title">
      <h2 id="actions-title" className="mb-4 text-xl font-medium tracking-[-0.015em] text-black">Acciones</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => announce("project")} className="group flex min-h-40 flex-col items-start justify-between rounded-lg border border-transparent bg-[#6063ee] p-6 text-left text-white transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]">
          <span className="grid size-10 place-items-center rounded-lg bg-white/20"><Plus aria-hidden="true" className="size-5" /></span>
          <span><span className="flex items-center gap-2 font-medium"><Sparkles aria-hidden="true" className="size-4" />Crear nuevo proyecto</span><span className="mt-1 block text-sm text-white/80">Empezá un nuevo chat con la IA.</span></span>
        </button>
        <button type="button" onClick={() => announce("templates")} className="group flex min-h-40 flex-col items-start justify-between rounded-lg border border-[#e1e3e4] bg-white p-6 text-left transition-colors hover:border-[#7e7576] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]">
          <span className="grid size-10 place-items-center rounded-lg bg-[#f3f4f5] text-black transition-colors group-hover:bg-[#e7e8e9]"><LayoutTemplate aria-hidden="true" className="size-5" /></span>
          <span><span className="font-medium text-black">Biblioteca de plantillas</span><span className="mt-1 block text-sm text-[#4c4546]">Construcciones listas para usar.</span></span>
        </button>
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-[#4c4546]">{message}</p>
    </section>
  );
}
