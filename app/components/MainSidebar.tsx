"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LuBlocks,
  LuChevronLeft,
  LuChevronRight,
  LuMessageSquare,
  LuSettings,
  LuTicket,
} from "react-icons/lu";

const items = [
  { label: "Co-Build", href: "/dashboard/builder", Icon: LuBlocks },
  { label: "Tickets", href: "/dashboard/tickets", Icon: LuTicket },
  { label: "Mensajes", href: "/dashboard/messages", Icon: LuMessageSquare },
  { label: "Configuracion", href: "/dashboard/config", Icon: LuSettings },
];

export function MainSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative w-full shrink-0 border-b border-[#cfc4c5] bg-[#ffffff] transition-[width] duration-200 md:border-b-0 md:border-r ${
        collapsed ? "md:w-16" : "md:w-60"
      }`}
    >
      <nav className="flex flex-row divide-x divide-[#cfc4c5] md:flex-col md:divide-x-0 md:divide-y md:border-b md:border-[#cfc4c5]">
        {items.map(({ label, href, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? label : undefined}
              className={`flex flex-1 items-center justify-center gap-3 py-5 text-xs font-semibold uppercase leading-4 tracking-[0.05em] ${
                collapsed ? "md:px-0" : "px-6"
              } ${
                active
                  ? "bg-[#edeeef] text-[#191c1d]"
                  : "text-[#4c4546] hover:bg-[#edeeef] hover:text-[#191c1d]"
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className={collapsed ? "md:hidden" : undefined}>{label}</span>
            </Link>
          );
        })}
      </nav>

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
