export type ClientProjectStatus = "draft" | "review" | "live";

export type ClientProject = {
  id: string;
  title: string;
  description: string;
  status: ClientProjectStatus;
  image: string;
};

export type ClientActivity = {
  id: string;
  actor: string;
  action: string;
  time: string;
  initials: string;
};

export const clientProjects: ClientProject[] = [
  { id: "project-1", title: "FinTech Dashboard UI", description: "Editado por última vez hace 2 h", status: "draft", image: "/Ilustraciones_base/dashboard.png" },
  { id: "project-2", title: "Retail Storefront", description: "Esperando tu aprobación", status: "review", image: "/Ilustraciones_base/Usar LP/screen.png" },
  { id: "project-3", title: "Marketing Site V2", description: "Publicado hace 2 días", status: "live", image: "/Dash 1/screen.png" },
];

export const clientActivity: ClientActivity[] = [
  { id: "activity-1", actor: "Martina, desarrolladora", action: "subió cambios al ticket “Checkout responsive”", time: "Hace 18 min", initials: "MG" },
  { id: "activity-2", actor: "Builto IA", action: "generó una nueva propuesta para Retail Storefront", time: "Hace 3 h", initials: "AI" },
  { id: "activity-3", actor: "Vos", action: "aprobaste la primera versión de FinTech Dashboard UI", time: "Ayer", initials: "NB" },
];
