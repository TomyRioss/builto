export default function ProjectsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1280px] animate-pulse px-4 py-8 md:px-10 md:py-10" aria-busy="true" aria-label="Cargando proyectos">
      <div className="h-9 w-48 rounded bg-[#dfe0e1]" />
      <div className="mt-3 h-5 max-w-md rounded bg-[#e7e8e9]" />
      <div className="mt-8 divide-y divide-[#cfc4c5] border-y border-[#cfc4c5] bg-white">{Array.from({ length: 4 }, (_, index) => <div key={index} className="grid min-h-24 grid-cols-3 items-center gap-6 px-6"><div className="h-4 rounded bg-[#e7e8e9]" /><div className="h-4 rounded bg-[#eceeef]" /><div className="h-4 rounded bg-[#eceeef]" /></div>)}</div>
    </div>
  );
}
