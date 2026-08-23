"use client";

import { useEffect } from "react";
import { CircleAlert, RefreshCw } from "lucide-react";

export default function DevProjectsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error("[dev-projects] fallo la pagina", error), [error]);
  return <div className="grid min-h-[70svh] place-items-center px-6 text-center"><div className="max-w-sm"><CircleAlert aria-hidden="true" className="mx-auto size-7 text-[#4648d4]" /><h1 className="mt-4 text-lg font-semibold">No pudimos cargar los proyectos</h1><p className="mt-2 text-sm leading-6 text-[#666768]">Hubo un problema al consultar Supabase. Intenta nuevamente en unos segundos.</p><button type="button" onClick={reset} className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-[#242424]"><RefreshCw aria-hidden="true" className="size-4" />Reintentar</button></div></div>;
}
