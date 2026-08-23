import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";

const TEMPLATES: Record<string, { name: string }> = {
  restaurante: { name: "Origen — Restaurante de alta cocina" },
  viajes: { name: "Aura — Viajes de autor & expediciones" },
  aeronautica: { name: "Aeronáutica" },
};

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = TEMPLATES[slug];

  if (!template) {
    notFound();
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-4 border-b border-[#f3f4f6] px-4 py-3 md:px-10">
        <Link
          href="/dashboard/templates"
          className="inline-flex items-center gap-1 text-sm text-[#4c4546] hover:text-[#000000]"
        >
          <LuArrowLeft className="size-4" aria-hidden />
          Volver
        </Link>
        <h1 className="text-sm font-semibold text-[#000000]">{template.name}</h1>
      </div>
      <iframe
        src={`/templates/${slug}/index.html`}
        className="w-full flex-1"
        title={template.name}
      />
    </div>
  );
}
