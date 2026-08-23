import Link from "next/link";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

const TEMPLATES = [
  {
    slug: "restaurante",
    name: "Origen — Restaurante de alta cocina",
    description: "Landing page para restaurante gourmet: reservas, menú interactivo, galería.",
  },
  {
    slug: "viajes",
    name: "Aura — Viajes de autor & expediciones",
    description: "Landing page para agencia de viajes: catálogo de destinos, itinerarios.",
  },
  {
    slug: "aeronautica",
    name: "Aeronáutica",
    description: "Landing page para empresa del rubro aeronáutico.",
  },
] as const;

export default function TemplatesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:px-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-1 text-sm text-[#4c4546] hover:text-[#000000]"
        >
          <LuArrowLeft className="size-4" aria-hidden />
          Volver
        </Link>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#000000]">
          Librería de plantillas
        </h1>
        <p className="text-sm leading-5 text-[#4c4546]">
          Pre construcciones listas para usar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TEMPLATES.map((template) => (
          <Link
            key={template.slug}
            href={`/dashboard/templates/${template.slug}`}
            className="group flex flex-col justify-between gap-4 rounded-lg border border-[#f3f4f6] bg-[#ffffff] p-6 transition-colors hover:border-[#000000]"
          >
            <div className="relative h-40 overflow-hidden rounded bg-[#f9fafb]">
              <iframe
                src={`/templates/${template.slug}/index.html`}
                className="absolute left-0 top-0 h-[800px] w-[1400px] origin-top-left"
                style={{ transform: "scale(0.2857)" }}
                tabIndex={-1}
                aria-hidden
              />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-6 text-[#000000]">
                {template.name}
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#4c4546]">
                {template.description}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[#4648d4]">
              Ver plantilla
              <LuArrowRight className="size-4" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
