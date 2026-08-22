import { LuArrowUp, LuSparkles } from "react-icons/lu";

// ponytail: mensajes mock, sin IA todavia
const messages = [
  { id: "1", from: "user", text: "Necesito una landing sobria para un estudio juridico." },
  { id: "2", from: "ai", text: "Te propongo hero con claim corto, tres areas de practica y formulario de contacto al pie. Paleta monocromatica con un acento indigo." },
  { id: "3", from: "user", text: "Sumale testimonios entre areas y contacto." },
  { id: "4", from: "ai", text: "Listo. Tres testimonios en fila en desktop y carrusel en mobile." },
];

export default function BuilderPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-[#cfc4c5] bg-[#ffffff] px-4 py-4 md:px-8">
        <span className="flex size-8 items-center justify-center rounded-md bg-[#edeeef] text-[#4648d4]">
          <LuSparkles className="size-4" aria-hidden />
        </span>
        <h1 className="truncate text-base font-medium leading-6">
          Landing para estudio juridico
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.from === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <p
                className={`max-w-[85%] rounded-lg px-4 py-3 text-base leading-6 ${
                  m.from === "user"
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
        <div className="mx-auto flex w-full max-w-[720px] items-center gap-3 rounded-lg border border-[#cfc4c5] bg-[#ffffff] px-4 py-3 focus-within:border-[#4648d4]">
          <input
            type="text"
            placeholder="Escribi que queres construir"
            className="min-w-0 flex-1 bg-transparent text-base leading-6 text-[#191c1d] outline-none placeholder:text-[#7e7576]"
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
  );
}
