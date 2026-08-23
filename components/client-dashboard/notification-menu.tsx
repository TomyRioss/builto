import { Bell } from "lucide-react";

export function NotificationMenu() {
  return (
    <details className="group relative shrink-0">
      <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-[#e1e3e4] text-[#4c4546] transition-colors hover:bg-[#f3f4f5] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4] [&::-webkit-details-marker]:hidden">
        <Bell aria-hidden="true" className="size-[1.1rem]" />
        <span className="sr-only">Ver notificaciones</span>
      </summary>
      <div className="absolute right-0 top-12 z-20 w-72 rounded-lg border border-[#e1e3e4] bg-white p-4 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)]">
        <p className="text-sm font-semibold text-black">Notificaciones</p>
        <p className="mt-2 text-sm leading-5 text-[#666768]">No tenés notificaciones nuevas.</p>
      </div>
    </details>
  );
}
