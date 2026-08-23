import { CircleHelp, FolderOpen, MessagesSquare, Settings, Sparkles, Waypoints, type LucideIcon } from "lucide-react";

export type ClientNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const clientNavigation: ClientNavigationItem[] = [
  { label: "Proyectos", href: "/client", icon: FolderOpen },
  { label: "Construir con IA", href: "/client#actions", icon: Sparkles },
  { label: "Tickets", href: "/client#tickets", icon: MessagesSquare },
  { label: "Seguimiento", href: "/client#activity", icon: Waypoints },
  { label: "Configuración", href: "/client#settings", icon: Settings },
];

export const clientSupportNavigation: ClientNavigationItem = {
  label: "Soporte",
  href: "mailto:soporte@builto.com",
  icon: CircleHelp,
};
