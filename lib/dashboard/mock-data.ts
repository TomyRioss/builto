export type DashboardSummary = {
  pendingTickets: number;
  activeTickets: number;
  activeProjects: number;
  unreadMessages: number;
};

export type RecentActivity = {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  type: "ticket" | "project" | "message";
};

export const dashboardSummary: DashboardSummary = {
  pendingTickets: 7,
  activeTickets: 4,
  activeProjects: 3,
  unreadMessages: 6,
};

export const recentActivity: RecentActivity[] = [
  { id: "activity-1", title: "Nueva respuesta en Landing Cafeteria", description: "El cliente respondio las preguntas del ticket #1042.", occurredAt: "Hace 12 min", type: "message" },
  { id: "activity-2", title: "Cotizacion enviada", description: "Enviaste una propuesta para el ticket #1038.", occurredAt: "Hace 1 h", type: "ticket" },
  { id: "activity-3", title: "Proyecto actualizado", description: "Portfolio Estudio Nomada paso a revision.", occurredAt: "Ayer", type: "project" },
];
