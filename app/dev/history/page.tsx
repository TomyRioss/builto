import { History } from "lucide-react";

export default function DeveloperHistoryPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header><p className="text-sm font-medium text-[#4648d4]">Espacio Developer</p><h1 className="mt-2 text-3xl font-semibold leading-tight text-black sm:text-4xl">Historial</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c4546] sm:text-base">Actividad reciente de tus tickets y proyectos.</p></header>
      <section className="mt-8 grid min-h-80 place-items-center border-y border-[#e1e3e4] px-6 py-16 text-center"><div className="max-w-md"><History aria-hidden="true" className="mx-auto size-7 text-[#777879]" /><h2 className="mt-4 text-lg font-semibold text-black">Sin actividad para mostrar</h2><p className="mt-2 text-sm leading-6 text-[#666768]">Los cambios de estado y acciones realizadas sobre tus tickets se mostraran aca.</p></div></section>
    </div>
  );
}
