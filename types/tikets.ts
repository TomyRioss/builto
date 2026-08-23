export type TicketStatus = "pendiente" | "en_progreso" | "urgente" | "completado";

export interface Ticket {
  id: number;
  fecha: string; // ISO date
  asunto: string;
  descripcion: string;
  estado: TicketStatus;
}