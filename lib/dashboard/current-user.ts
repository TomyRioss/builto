import type { DashboardRole } from "@/lib/dashboard/navigation";

export type DashboardUser = {
  name: string;
  initials: string;
  role: DashboardRole;
};

// TODO(TOM-61): reemplazar por el usuario y rol de la sesión autenticada.
export const currentDashboardUser: DashboardUser = {
  name: "Nahuel Brandalise",
  initials: "NB",
  role: "developer",
};
