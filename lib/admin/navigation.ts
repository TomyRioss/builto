import { CreditCard, Gauge, History, ShieldCheck, UsersRound, Tickets, type LucideIcon } from "lucide-react";

export type AdminNavigationItem = { label: string; href: string; icon: LucideIcon };

export const adminNavigation: AdminNavigationItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Gauge },
  { label: "Tickets", href: "/admin/tickets", icon: Tickets },
  { label: "Pagos", href: "/admin/payments", icon: CreditCard },
  { label: "Developers", href: "/admin/developers", icon: UsersRound },
  { label: "Auditoria", href: "/admin/audit", icon: History },
  { label: "Equipo", href: "/admin/team", icon: ShieldCheck },
];
