import { LuSearch, LuArrowUp } from "react-icons/lu";

// ponytail: bandeja mock, sin backend
const threads = [
  { id: "1", name: "Martina Alvarez", preview: "Te paso el brief actualizado.", time: "09:41", unread: 2, active: true },
  { id: "2", name: "Equipo Producto", preview: "Quedo aprobado el wireframe.", time: "Ayer", unread: 0, active: false },
  { id: "3", name: "Julian Perez", preview: "Vemos el pricing manana?", time: "Lun", unread: 0, active: false },
  { id: "4", name: "Soporte Builto", preview: "Tu plan se renovo correctamente.", time: "12 ago", unread: 0, active: false },
];

const conversation = [
  { id: "1", mine: false, text: "Hola, te paso el brief actualizado del proyecto." },
  { id: "2", mine: true, text: "Perfecto, lo reviso y te confirmo hoy." },
  { id: "3", mine: false, text: "Genial. Sumamos una seccion de casos de exito." },
];

export default function MessagesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <div className="flex w-full shrink-0 flex-col border-b border-[#cfc4c5] bg-[#ffffff] md:w-80 md:border-b-0 md:border-r">
        <div className="border-b border-[#cfc4c5] px-6 py-5">
          <div className="flex items-center gap-3 rounded-md border border-[#cfc4c5] px-3 py-2 focus-within:border-[#4648d4]">
            <LuSearch className="size-4 shrink-0 text-[#7e7576]" aria-hidden />
            <input
              type="search"
              placeholder="Buscar"
              className="min-w-0 flex-1 bg-transparent text-sm leading-5 outline-none placeholder:text-[#7e7576]"
            />
          </div>
        </div>

        <ul className="divide-y divide-[#cfc4c5] border-b border-[#cfc4c5]">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={`flex w-full items-start gap-3 px-6 py-5 text-left ${
                  t.active ? "bg-[#edeeef]" : "hover:bg-[#f3f4f5]"
                }`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e1e3e4] text-xs font-semibold uppercase tracking-[0.05em] text-[#4c4546]">
                  {t.name.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium leading-5">{t.name}</span>
                    <span className="shrink-0 text-xs text-[#7e7576]">{t.time}</span>
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-sm leading-5 text-[#4c4546]">{t.preview}</span>
                    {t.unread > 0 && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4648d4] text-[11px] font-semibold text-[#ffffff]">
                        {t.unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-[#cfc4c5] bg-[#ffffff] px-4 py-4 md:px-8">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#e1e3e4] text-xs font-semibold uppercase tracking-[0.05em] text-[#4c4546]">
            MA
          </span>
          <h1 className="truncate text-base font-medium leading-6">Martina Alvarez</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
            {conversation.map((m) => (
              <div key={m.id} className={m.mine ? "flex justify-end" : "flex justify-start"}>
                <p
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-base leading-6 ${
                    m.mine
                      ? "bg-[#000000] text-[#ffffff]"
                      : "border border-[#cfc4c5] bg-[#ffffff] text-[#191c1d]"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#cfc4c5] bg-[#ffffff] px-4 py-4 md:px-8">
          <div className="mx-auto flex w-full max-w-[720px] items-center gap-3 rounded-lg border border-[#cfc4c5] px-4 py-3 focus-within:border-[#4648d4]">
            <input
              type="text"
              placeholder="Escribi un mensaje"
              className="min-w-0 flex-1 bg-transparent text-base leading-6 outline-none placeholder:text-[#7e7576]"
            />
            <button
              type="button"
              aria-label="Enviar"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[#000000] text-[#ffffff] hover:bg-[#1b1b1b]"
            >
              <LuArrowUp className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
