import { Filter, FolderSearch, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DevProjectCard } from "@/components/dev/project-card";
import { getAllDevProjects } from "@/lib/dev/projects";
import { isStaff } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function DevProjectsPage(props: PageProps<"/dev/projects">) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isStaff(session.user.role)) redirect("/dashboard");

  const searchParams = await props.searchParams;
  const query = param(searchParams.q).toLocaleLowerCase("es");
  const priority = param(searchParams.priority).toLocaleLowerCase("es");
  const technology = param(searchParams.technology).toLocaleLowerCase("es");
  const projects = await getAllDevProjects();

  const technologies = [...new Set(projects.flatMap((project) => project.metadata.technologies))].sort((a, b) => a.localeCompare(b, "es"));
  const priorities = [...new Set(projects.map((project) => project.metadata.priority).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "es"));
  const filtered = projects.filter((project) => {
    const searchable = [project.name, project.owner.name, project.metadata.preview, ...project.metadata.technologies, ...project.tickets.map((ticket) => ticket.title)].filter(Boolean).join(" ").toLocaleLowerCase("es");
    const matchesPriority = !priority || (priority === "__none" ? !project.metadata.priority : project.metadata.priority?.toLocaleLowerCase("es") === priority);
    return (!query || searchable.includes(query)) && matchesPriority && (!technology || project.metadata.technologies.some((item) => item.toLocaleLowerCase("es") === technology));
  });
  const hasFilters = Boolean(query || priority || technology);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-[#4648d4]">Espacio Developer</p><h1 className="mt-2 text-3xl font-semibold leading-tight text-black sm:text-4xl">Todos los proyectos</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c4546] sm:text-base">Consulta los proyectos de clientes y revisa sus tickets asociados.</p></div><p className="text-sm text-[#666768]">{filtered.length} {filtered.length === 1 ? "proyecto" : "proyectos"}</p></header>

      <form className="mt-8 grid gap-3 border-y border-[#e1e3e4] py-4 md:grid-cols-[minmax(16rem,1fr)_12rem_14rem_auto]" role="search">
        <label className="relative"><span className="sr-only">Buscar proyectos</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777879]" /><input type="search" name="q" defaultValue={param(searchParams.q)} placeholder="Buscar proyecto o ticket" className="h-11 w-full rounded-md border border-[#d9dadb] bg-white pl-10 pr-3 text-sm outline-none placeholder:text-[#8a8b8c] focus:border-[#4648d4] focus:ring-2 focus:ring-[#daddff]" /></label>
        <label><span className="sr-only">Filtrar por prioridad</span><select name="priority" defaultValue={param(searchParams.priority)} className="h-11 w-full rounded-md border border-[#d9dadb] bg-white px-3 text-sm outline-none focus:border-[#4648d4] focus:ring-2 focus:ring-[#daddff]"><option value="">Toda prioridad</option><option value="__none">Sin prioridad</option>{priorities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><span className="sr-only">Filtrar por tecnologia</span><select name="technology" defaultValue={param(searchParams.technology)} className="h-11 w-full rounded-md border border-[#d9dadb] bg-white px-3 text-sm outline-none focus:border-[#4648d4] focus:ring-2 focus:ring-[#daddff]"><option value="">Toda tecnologia</option>{technologies.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-[#242424] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]"><Filter aria-hidden="true" className="size-4" />Filtrar</button>
      </form>

      {filtered.length === 0 ? <div className="mt-10 flex min-h-72 flex-col items-center justify-center border-y border-[#e1e3e4] px-6 py-16 text-center"><FolderSearch aria-hidden="true" className="size-7 text-[#777879]" /><h2 className="mt-4 text-lg font-semibold text-black">{hasFilters ? "No encontramos coincidencias" : "No hay proyectos cargados"}</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#666768]">{hasFilters ? "Proba ajustando la busqueda o quitando algun filtro." : "Los proyectos creados por clientes apareceran automaticamente en esta seccion."}</p></div> : <section aria-label="Listado de proyectos" className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filtered.map((project) => <DevProjectCard key={project.id} project={project} currentDeveloperId={session.user.id} />)}</section>}
    </div>
  );
}
