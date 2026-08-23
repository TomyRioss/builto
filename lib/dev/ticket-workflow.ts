import type { TicketStatus } from "@/app/generated/prisma/enums";

export type DeveloperTicketAction = "take" | "start" | "work" | "waiting" | "complete" | "readonly";

export function getDeveloperTicketLabel(status: TicketStatus, assignedDevId: string | null, currentDeveloperId?: string) {
  if (status === "PAID") {
    if (!assignedDevId) return "Disponible";
    return assignedDevId === currentDeveloperId ? "Asignado a vos" : "Asignado";
  }
  if (status === "IN_PROGRESS") return "En desarrollo";
  if (status === "REVIEW") return "En revision";
  if (status === "DONE") return "Completado";
  return "No disponible";
}

export function getDeveloperTicketAction(status: TicketStatus, assignedDevId: string | null, currentDeveloperId: string): DeveloperTicketAction {
  if (status === "DONE") return "complete";
  if (assignedDevId && assignedDevId !== currentDeveloperId) return "readonly";
  if (!assignedDevId) return status === "PAID" ? "take" : "readonly";
  if (status === "PAID") return "start";
  if (status === "IN_PROGRESS") return "work";
  if (status === "REVIEW") return "waiting";
  return "readonly";
}
