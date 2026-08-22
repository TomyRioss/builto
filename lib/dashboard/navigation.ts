import type { LucideIcon } from "lucide-react";
import {
  FolderKanban,
  History,
  House,
  MessageCircle,
  MessagesSquare,
  ReceiptText,
  TicketCheck,
  Users,
} from "lucide-react";

export const dashboardRoles = ["developer", "admin", "owner"] as const;

export type DashboardRole = (typeof dashboardRoles)[number];

export type DashboardPermission =
  | "dashboard:view"
  | "tickets:view"
  | "projects:view"
  | "users:view"
  | "messages:view"
  | "transactions:view"
  | "message-history:view"
  | "activity-history:view";

export type DashboardNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: DashboardPermission;
  description: string;
};

const commonPermissions: DashboardPermission[] = [
  "dashboard:view",
  "tickets:view",
  "projects:view",
  "users:view",
  "messages:view",
];

export const rolePermissions: Record<DashboardRole, readonly DashboardPermission[]> = {
  developer: commonPermissions,
  admin: [
    ...commonPermissions,
    "transactions:view",
    "message-history:view",
    "activity-history:view",
  ],
  owner: [
    ...commonPermissions,
    "transactions:view",
    "message-history:view",
    "activity-history:view",
  ],
};

export const dashboardNavigation: readonly DashboardNavigationItem[] = [
  { label: "Inicio", href: "/dashboard", icon: House, permission: "dashboard:view", description: "Resumen operativo" },
  { label: "Tickets", href: "/dashboard/tickets", icon: TicketCheck, permission: "tickets:view", description: "Solicitudes y cotizaciones" },
  { label: "Proyectos", href: "/dashboard/projects", icon: FolderKanban, permission: "projects:view", description: "Proyectos activos" },
  { label: "Usuarios", href: "/dashboard/users", icon: Users, permission: "users:view", description: "Clientes, programadores y staff" },
  { label: "Mensajes", href: "/dashboard/messages", icon: MessageCircle, permission: "messages:view", description: "Conversaciones con clientes" },
  { label: "Transacciones", href: "/dashboard/transactions", icon: ReceiptText, permission: "transactions:view", description: "Pagos recibidos" },
  { label: "Historial de acciones", href: "/dashboard/activity-history", icon: History, permission: "activity-history:view", description: "Actividad del equipo" },
  { label: "Historial de mensajes", href: "/dashboard/message-history", icon: MessagesSquare, permission: "message-history:view", description: "Conversaciones de la app" },
];

export function hasPermission(role: DashboardRole, permission: DashboardPermission) {
  return rolePermissions[role].includes(permission);
}

export function getNavigationForRole(role: DashboardRole) {
  return dashboardNavigation.filter((item) => hasPermission(role, item.permission));
}

export function getNavigationItemBySlug(slug: string) {
  return dashboardNavigation.find((item) => item.href === `/dashboard/${slug}`);
}

export const roleLabels: Record<DashboardRole, string> = {
  developer: "Developer",
  admin: "Administrador",
  owner: "Owner",
};
