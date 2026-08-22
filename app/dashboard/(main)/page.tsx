import Link from "next/link";
import { LuArrowUpRight, LuPlus, LuSparkles } from "react-icons/lu";

// ponytail: data mock, se cablea cuando exista la IA
const chats = [
  { id: "1", title: "Landing para estudio juridico", updated: "Hace 2 horas", preview: "Necesito una landing sobria con formulario de contacto." },
  { id: "2", title: "Dashboard de metricas", updated: "Ayer", preview: "Sumemos filtros por fecha y export a CSV." },
  { id: "3", title: "Onboarding de usuarios", updated: "Hace 3 dias", preview: "Tres pasos, con progreso arriba." },
  { id: "4", title: "Rediseno de pricing", updated: "Hace 1 semana", preview: "Tres planes y un toggle anual/mensual." },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.01em] md:text-[32px] md:leading-10">
            Tus chats
          </h1>
          <p className="mt-2 text-sm leading-5 text-[#4c4546]">
            Conversaciones con la IA de Builto.
          </p>
        </div>
        <Link
          href="/dashboard/builder"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#000000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-[#ffffff] hover:bg-[#1b1b1b]"
        >
          <LuPlus className="size-4" aria-hidden />
          Nuevo chat
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-[#cfc4c5] border-y border-[#cfc4c5] bg-[#ffffff]">
        {chats.map((chat) => (
          <li key={chat.id}>
            <Link
              href="/dashboard/builder"
              className="flex items-center gap-4 px-4 py-5 hover:bg-[#f3f4f5] md:px-6"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#edeeef] text-[#4648d4]">
                <LuSparkles className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-medium leading-6">
                  {chat.title}
                </span>
                <span className="mt-1 block truncate text-sm leading-5 text-[#4c4546]">
                  {chat.preview}
                </span>
              </span>
              <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.05em] text-[#7e7576] sm:block">
                {chat.updated}
              </span>
              <LuArrowUpRight className="size-4 shrink-0 text-[#7e7576]" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
