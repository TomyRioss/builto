import {
  FolderOpen,
  Gauge,
  History,
  MessagesSquare,
  Settings,
  TicketCheck,
  type LucideIcon,
} from "lucide-react";

export type DevNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const devNavigation: DevNavigationItem[] = [
  { label: "Dashboard", href: "/dev/dashboard", icon: Gauge },
  { label: "Proyectos", href: "/dev/projects", icon: FolderOpen },
  { label: "Mis Tickets", href: "/dev/tickets", icon: TicketCheck },
  { label: "Mensajes", href: "/dev/message", icon: MessagesSquare },
  { label: "Historial", href: "/dev/history", icon: History },
  { label: "Settings", href: "/dev/settings", icon: Settings },
];
