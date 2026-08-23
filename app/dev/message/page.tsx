import { MessageSquareText } from "lucide-react";

export default function DeveloperMessagesPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header><p className="text-sm font-medium text-[#4648d4]">Espacio Developer</p><h1 className="mt-2 text-3xl font-semibold leading-tight text-black sm:text-4xl">Mensajes</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c4546] sm:text-base">Conversaciones relacionadas con tus proyectos y tickets asignados.</p></header>
      <section className="mt-8 grid min-h-80 place-items-center border-y border-[#e1e3e4] px-6 py-16 text-center"><div className="max-w-md"><MessageSquareText aria-hidden="true" className="mx-auto size-7 text-[#777879]" /><h2 className="mt-4 text-lg font-semibold text-black">Todavia no hay conversaciones</h2><p className="mt-2 text-sm leading-6 text-[#666768]">Los mensajes vinculados a tus tickets apareceran en este apartado cuando el flujo de mensajeria Developer este habilitado.</p></div></section>
    </div>
  );
}
