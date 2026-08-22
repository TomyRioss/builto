import Link from "next/link";
import { LuArrowLeft, LuPlus } from "react-icons/lu";

// ponytail: data mock, se cablea cuando exista la IA
const chats = [
  { id: "1", title: "Landing para estudio juridico", updated: "2h", active: true },
  { id: "2", title: "Dashboard de metricas", updated: "1d", active: false },
  { id: "3", title: "Onboarding de usuarios", updated: "3d", active: false },
  { id: "4", title: "Rediseno de pricing", updated: "1sem", active: false },
];

export function BuilderSidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#cfc4c5] bg-[#ffffff] md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-3 border-b border-[#cfc4c5] px-6 py-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.05em] text-[#4c4546] hover:text-[#191c1d]"
        >
          <LuArrowLeft className="size-4" aria-hidden />
          Chats
        </Link>
        <button
          type="button"
          aria-label="Nuevo chat"
          className="inline-flex size-8 items-center justify-center rounded-md bg-[#000000] text-[#ffffff] hover:bg-[#1b1b1b]"
        >
          <LuPlus className="size-4" aria-hidden />
        </button>
      </div>

      <nav className="flex flex-col divide-y divide-[#cfc4c5] border-b border-[#cfc4c5]">
        {chats.map((chat) => (
          <button
            key={chat.id}
            type="button"
            className={`flex items-center gap-3 px-6 py-5 text-left ${
              chat.active ? "bg-[#edeeef]" : "hover:bg-[#f3f4f5]"
            }`}
          >
            <span className="min-w-0 flex-1 truncate text-sm leading-5 text-[#191c1d]">
              {chat.title}
            </span>
            <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.05em] text-[#7e7576]">
              {chat.updated}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
