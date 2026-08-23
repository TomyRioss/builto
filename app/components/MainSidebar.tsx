"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LuBlocks,
  LuChevronLeft,
  LuChevronRight,
  LuCircleHelp,
  LuHouse,
  LuMessageSquare,
  LuPlus,
  LuSettings,
  LuTicket,
} from "react-icons/lu";

const items = [
  { label: "Inicio", href: "/dashboard", Icon: LuHouse, exact: true },
  { label: "Construir con IA", href: "/dashboard/builder", Icon: LuBlocks },
  { label: "Tickets", href: "/dashboard/tickets", Icon: LuTicket },
  { label: "Mensajes", href: "/dashboard/messages", Icon: LuMessageSquare },
  { label: "Configuracion", href: "/dashboard/config", Icon: LuSettings },
];

export function MainSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex w-full shrink-0 flex-col border-b border-[#cfc4c5] bg-[#ffffff] transition-[width] duration-200 md:sticky md:top-[73px] md:h-[calc(100vh-73px)] md:self-start md:border-b-0 md:border-r ${
        collapsed ? "md:w-16" : "md:w-60"
      }`}
    >
      <nav className="flex flex-row border-b border-[#cfc4c5] md:flex-col">
        {items.map(({ label, href, Icon, exact }) => {
          // "/dashboard" es prefijo de todas las rutas: solo matchea exacto.
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? label : undefined}
              className={`flex flex-1 items-center justify-center gap-3 border-l border-[#e1e3e4] py-5 text-xs font-semibold uppercase leading-4 tracking-[0.05em] first:border-l-0 md:border-l-0 md:border-t md:border-r-2 md:first:border-t-0 ${
                collapsed ? "md:px-0" : "px-6"
              } ${
                active
                  ? "border-[#4648d4] bg-[#edeeef] text-[#4648d4] md:border-t-[#e1e3e4]"
                  : "border-transparent text-[#4c4546] hover:bg-[#edeeef] hover:text-[#191c1d] md:border-t-[#e1e3e4]"
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className={collapsed ? "md:hidden" : undefined}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-stretch gap-4 p-4">
        <button
          type="button"
          title="Soporte"
          className="flex items-center justify-center gap-2 rounded-lg py-1 text-[#4c4546] hover:text-[#191c1d]"
        >
          <LuCircleHelp className="size-6 shrink-0" aria-hidden />
          <span className={`text-base font-medium ${collapsed ? "md:hidden" : undefined}`}>Soporte</span>
        </button>

        <Link
          href="/dashboard/builder"
          title={collapsed ? "Nuevo proyecto" : undefined}
          className={`flex items-center justify-center gap-2 rounded-md bg-[#000000] py-3.5 text-sm font-medium text-[#ffffff] hover:bg-[#1b1b1b] ${
            collapsed ? "md:size-11 md:px-0" : "px-4"
          }`}
        >
          <LuPlus className="size-4 shrink-0" aria-hidden />
          <span className={collapsed ? "md:hidden" : undefined}>Nuevo proyecto</span>
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
        title={collapsed ? "Expandir menu" : "Colapsar menu"}
        className="absolute -right-3 top-4 z-10 hidden size-6 items-center justify-center rounded border border-[#cfc4c5] bg-[#ffffff] text-[#4c4546] hover:border-[#191c1d] hover:text-[#191c1d] md:flex"
      >
        {collapsed ? (
          <LuChevronRight className="size-3.5" aria-hidden />
        ) : (
          <LuChevronLeft className="size-3.5" aria-hidden />
        )}
      </button>
    </aside>
  );
}
