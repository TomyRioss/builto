import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { currentDashboardUser } from "@/lib/dashboard/current-user";
import { getNavigationItemBySlug, hasPermission } from "@/lib/dashboard/navigation";

export default async function DashboardSectionPage({ params }: PageProps<"/dashboard/[section]">) {
  const { section } = await params;
  const item = getNavigationItemBySlug(section);

  if (!item || !hasPermission(currentDashboardUser.role, item.permission)) {
    notFound();
  }

  const Icon = item.icon;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-[#6063ee]">Dashboard</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[#eef0ff] text-[#4648d4]"><Icon aria-hidden="true" className="size-5" /></span>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-black sm:text-3xl">{item.label}</h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#666768] sm:text-base">{item.description}</p>
      </header>

      <section className="grid min-h-80 place-items-center rounded-xl border border-dashed border-[#d9dadb] bg-white p-6 text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[#f3f4f5] text-[#4c4546]"><Construction aria-hidden="true" className="size-5" /></span>
          <h2 className="mt-4 font-semibold text-black">Sección preparada</h2>
          <p className="mt-2 text-sm leading-6 text-[#666768]">La ruta y sus permisos ya están configurados. El contenido funcional se incorporará en el siguiente paso.</p>
        </div>
      </section>
    </div>
  );
}
