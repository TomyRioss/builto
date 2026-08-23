"use client";

import { useEffect } from "react";
import { LuCircleAlert, LuRefreshCw } from "react-icons/lu";

export default function ProjectsError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => console.error("[projects] fallo la pagina", error), [error]);

  return (
    <div className="mx-auto grid min-h-80 w-full max-w-[1280px] place-items-center px-4 py-8 text-center md:px-10">
      <div className="max-w-sm">
        <LuCircleAlert aria-hidden className="mx-auto size-6 text-[#4648d4]" />
        <h1 className="mt-4 text-base font-semibold">No pudimos cargar los proyectos</h1>
        <p className="mt-2 text-sm leading-5 text-[#4c4546]">Hubo un error al consultar la base. Intenta nuevamente en unos segundos.</p>
        <button type="button" onClick={() => retry()} className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-[#191c1d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-white hover:bg-[#303334]"><LuRefreshCw aria-hidden className="size-4" />Reintentar</button>
      </div>
    </div>
  );
}
