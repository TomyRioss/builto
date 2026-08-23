import type { TicketStatus } from "@/app/generated/prisma/enums";

export const ADMIN_TICKET_STATUS: Record<TicketStatus, string> = {
  PENDING: "Por revisar", CLARIFYING: "Aclarando", QUOTED: "Cotizado", ACCEPTED: "Aceptado", PAID: "Pagado", IN_PROGRESS: "En desarrollo", REVIEW: "En revision", DONE: "Completado", REJECTED: "Rechazado", CANCELLED: "Cancelado",
};

export function money(value: { toString(): string }, currency: string) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(Number(value.toString()));
}
