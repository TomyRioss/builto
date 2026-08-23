import Image from "next/image";
import { MoreVertical, UserRoundSearch } from "lucide-react";
import type { ClientProject, ClientProjectStatus } from "@/lib/client-dashboard/mock-data";

const statusMeta: Record<ClientProjectStatus, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "border-[#e1e3e4] bg-[#f3f4f5] text-black" },
  review: { label: "Revisión", className: "border-[#c0c1ff] bg-[#eef2ff] text-[#4648d4]" },
  live: { label: "Publicado", className: "border-[#c9e8d5] bg-[#eff9f3] text-[#187342]" },
};

export function ProjectCard({ project }: { project: ClientProject }) {
  const status = statusMeta[project.status];
  return (
    <article className="group overflow-hidden rounded-lg border border-[#e1e3e4] bg-white transition-[border-color,box-shadow] hover:border-[#7e7576] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)]">
      <div className="relative aspect-[16/8.5] overflow-hidden border-b border-[#e1e3e4] bg-[#f3f4f5]">
        <Image src={project.image} alt={`Vista previa de ${project.title}`} fill className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]" sizes="(max-width: 768px) 100vw, 420px" />
        <span className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded border px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.05em] ${status.className}`}>{project.status === "review" && <UserRoundSearch aria-hidden="true" className="size-3" />}{status.label}</span>
      </div>
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0"><h3 className="font-medium text-black transition-colors group-hover:text-[#4648d4]">{project.title}</h3><p className="mt-2 text-sm text-[#4c4546]">{project.description}</p></div>
        <details className="group/options relative shrink-0">
          <summary className="grid size-8 cursor-pointer list-none place-items-center rounded-md text-[#4c4546] hover:bg-[#f3f4f5] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4] [&::-webkit-details-marker]:hidden"><MoreVertical aria-hidden="true" className="size-4" /><span className="sr-only">Más opciones para {project.title}</span></summary>
          <div className="absolute right-0 top-9 z-20 w-48 rounded-lg border border-[#e1e3e4] bg-white p-3 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)]"><p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#777879]">Opciones</p><p className="mt-2 text-sm leading-5 text-[#4c4546]">La edición estará disponible próximamente.</p></div>
        </details>
      </div>
    </article>
  );
}
