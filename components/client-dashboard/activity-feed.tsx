"use client";

import { ListFilter } from "lucide-react";
import { useState } from "react";
import type { ClientActivity } from "@/lib/client-dashboard/mock-data";

export function ActivityFeed({ activities }: { activities: ClientActivity[] }) {
  const [showAll, setShowAll] = useState(true);
  const visibleActivities = showAll ? activities : activities.slice(0, 1);

  return (
    <aside id="activity" aria-labelledby="activity-title" className="lg:sticky lg:top-10">
      <div className="mb-4 flex items-center justify-between"><h2 id="activity-title" className="text-xl font-medium tracking-[-0.015em] text-black">Actividad</h2><button type="button" onClick={() => setShowAll((value) => !value)} aria-pressed={!showAll} aria-label={showAll ? "Mostrar solo la actividad más reciente" : "Mostrar toda la actividad"} className="grid size-9 place-items-center rounded-md text-[#4c4546] hover:bg-[#f3f4f5] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]"><ListFilter aria-hidden="true" className="size-4" /></button></div>
      <div className="overflow-hidden rounded-lg border border-[#e1e3e4] bg-white">
        {visibleActivities.length === 0 ? <div className="p-8 text-center"><p className="text-sm font-medium text-black">Todavía no hay actividad</p><p className="mt-1 text-xs text-[#666768]">Las novedades aparecerán acá.</p></div> : <ul className="divide-y divide-[#e1e3e4]">{visibleActivities.map((activity) => <li key={activity.id} className="flex gap-4 p-4 transition-colors hover:bg-[#f8f9fa]"><span aria-hidden="true" className={activity.initials === "AI" ? "grid size-8 shrink-0 place-items-center rounded-full bg-[#eef2ff] text-[0.65rem] font-semibold text-[#4648d4]" : "grid size-8 shrink-0 place-items-center rounded-full bg-[#e1e3e4] text-[0.65rem] font-semibold text-black"}>{activity.initials}</span><div><p className="text-sm leading-5 text-black"><strong className="font-semibold">{activity.actor}</strong> {activity.action}</p><time className="mt-2 block text-xs text-[#666768]">{activity.time}</time></div></li>)}</ul>}
      </div>
    </aside>
  );
}
