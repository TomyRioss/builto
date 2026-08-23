const sections = [
  {
    title: "Cuenta",
    rows: [
      { label: "Nombre", hint: "Como te ven en Builto", control: "input", value: "Tomy Rios" },
      { label: "Email", hint: "Usado para iniciar sesion", control: "input", value: "tomy@builto.app" },
      { label: "Idioma", hint: "Idioma de la interfaz", control: "select", options: ["Espanol", "English"] },
    ],
  },
  {
    title: "Notificaciones",
    rows: [
      { label: "Email", hint: "Resumen diario de actividad", control: "toggle", on: true },
      { label: "Mensajes nuevos", hint: "Aviso al recibir un mensaje", control: "toggle", on: true },
      { label: "Novedades", hint: "Anuncios de producto", control: "toggle", on: false },
    ],
  },
  {
    title: "Apariencia",
    rows: [
      { label: "Tema", hint: "Claro u oscuro", control: "select", options: ["Claro", "Oscuro", "Sistema"] },
      { label: "Densidad", hint: "Espaciado de la interfaz", control: "select", options: ["Comoda", "Compacta"] },
    ],
  },
] as const;

export default function ConfigPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-10">
      <h1 className="text-2xl font-semibold leading-8 tracking-[-0.01em] md:text-[32px] md:leading-10">
        Configuracion
      </h1>
      <p className="mt-2 text-sm leading-5 text-[#4c4546]">
        Preferencias de tu cuenta y de la interfaz.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
              {section.title}
            </h2>

            <div className="mt-3 divide-y divide-[#cfc4c5] border-y border-[#cfc4c5] bg-[#ffffff]">
              {section.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-5">{row.label}</p>
                    <p className="mt-1 text-sm leading-5 text-[#4c4546]">{row.hint}</p>
                  </div>

                  {row.control === "input" && (
                    <input
                      type="text"
                      defaultValue={row.value}
                      className="w-full rounded-md border border-[#cfc4c5] bg-[#ffffff] px-3 py-2 text-sm leading-5 outline-none focus:border-[#4648d4] md:w-64"
                    />
                  )}

                  {row.control === "select" && (
                    <select
                      className="w-full rounded-md border border-[#cfc4c5] bg-[#ffffff] px-3 py-2 text-sm leading-5 outline-none focus:border-[#4648d4] md:w-64"
                      defaultValue={row.options[0]}
                    >
                      {row.options.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  )}

                  {row.control === "toggle" && (
                    <label className="inline-flex shrink-0 cursor-pointer items-center">
                      <input type="checkbox" defaultChecked={row.on} className="peer sr-only" />
                      <span className="relative h-6 w-11 rounded-full bg-[#cfc4c5] transition-colors peer-checked:bg-[#000000] after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-[#ffffff] after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-[#000000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-[#ffffff] hover:bg-[#1b1b1b]"
        >
          Guardar cambios
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-[#cfc4c5] bg-[#ffffff] px-5 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-[#4c4546] hover:bg-[#edeeef] hover:text-[#191c1d]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
