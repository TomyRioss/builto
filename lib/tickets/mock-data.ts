export type TicketStatus = "pending" | "in_progress";
export type TicketPriority = "high" | "medium" | "low";

export type Ticket = {
  id: string;
  title: string;
  client: string;
  status: TicketStatus;
  priority: TicketPriority;
  budget: number | null;
  updatedAt: string;
  unreadMessages: number;
};

export const tickets: Ticket[] = [
  { id: "TCK-1042", title: "Landing para cafetería de especialidad", client: "Café Aurora", status: "pending", priority: "high", budget: null, updatedAt: "Hace 12 min", unreadMessages: 2 },
  { id: "TCK-1041", title: "Integración de formulario con CRM", client: "Estudio Norte", status: "pending", priority: "medium", budget: 180000, updatedAt: "Hace 45 min", unreadMessages: 0 },
  { id: "TCK-1039", title: "Catálogo online para mayorista", client: "Distribuidora Sur", status: "pending", priority: "low", budget: null, updatedAt: "Hace 3 h", unreadMessages: 1 },
  { id: "TCK-1038", title: "Dashboard de métricas comerciales", client: "Nodo Analytics", status: "in_progress", priority: "high", budget: 420000, updatedAt: "Hace 1 h", unreadMessages: 0 },
  { id: "TCK-1035", title: "Portfolio para estudio de arquitectura", client: "Estudio Nómada", status: "in_progress", priority: "medium", budget: 260000, updatedAt: "Ayer", unreadMessages: 3 },
  { id: "TCK-1032", title: "Optimización responsive de ecommerce", client: "Tienda Minimal", status: "in_progress", priority: "medium", budget: 210000, updatedAt: "Hace 2 días", unreadMessages: 0 },
];
