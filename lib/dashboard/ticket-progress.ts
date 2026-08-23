import type { TicketStatus } from "@/app/generated/prisma/enums";

/**
 * Cronograma del ticket. No hay tabla de etapas: se deriva del `status` y de
 * las fechas que ya existen (ticket.createdAt, quote.createdAt, updatedAt).
 * Si aparece una tabla de eventos, esto se reemplaza por una lectura directa.
 */
export type Stage = {
  key: string;
  label: string;
  detail: string;
  state: "done" | "current" | "pending";
  at: Date | null;
};

const STAGES = [
  {
    key: "request",
    label: "Solicitud",
    detail: "Recibimos tu pedido y revisamos los detalles del proyecto.",
    statuses: ["PENDING", "CLARIFYING"] as TicketStatus[],
  },
  {
    key: "approval",
    label: "Aprobacion",
    detail: "Confirmamos el alcance, el presupuesto y el tiempo estimado.",
    statuses: ["QUOTED", "ACCEPTED", "PAID"] as TicketStatus[],
  },
  {
    key: "build",
    label: "Desarrollo",
    detail: "Un dev toma el ticket y escribe los cambios.",
    statuses: ["IN_PROGRESS"] as TicketStatus[],
  },
  {
    key: "qa",
    label: "Control de calidad",
    detail: "Revisamos que todo funcione y cumpla con lo solicitado.",
    statuses: ["REVIEW"] as TicketStatus[],
  },
  {
    key: "delivery",
    label: "Entrega final",
    detail: "Los cambios quedan publicados y el ticket se cierra.",
    statuses: ["DONE"] as TicketStatus[],
  },
];

/** Estados que cortan el flujo: no hay etapa actual, el ticket esta cerrado. */
export const CLOSED: TicketStatus[] = ["REJECTED", "CANCELLED"];

const PERCENT = [10, 35, 60, 85, 100];

export type Progress = {
  stages: Stage[];
  percent: number;
  currentLabel: string;
  closed: boolean;
};

type Input = {
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  /** Fecha de la primera cotizacion enviada, si hay. */
  quotedAt: Date | null;
};

export function ticketProgress({
  status,
  createdAt,
  updatedAt,
  quotedAt,
}: Input): Progress {
  const closed = CLOSED.includes(status);
  const index = STAGES.findIndex((s) => s.statuses.includes(status));
  // Un status desconocido no puede romper la vista: cae en la primera etapa.
  const current = index === -1 ? 0 : index;

  const stages: Stage[] = STAGES.map((stage, i) => {
    const state: Stage["state"] = closed
      ? i < current
        ? "done"
        : "pending"
      : i < current
        ? "done"
        : i === current
          ? "current"
          : "pending";

    // Solo fechas reales: la etapa que no tiene dato en la base no inventa una.
    const at =
      i === 0
        ? createdAt
        : i === 1
          ? quotedAt
          : i === current && !closed
            ? updatedAt
            : null;

    return { key: stage.key, label: stage.label, detail: stage.detail, state, at };
  });

  return {
    stages,
    percent: closed ? PERCENT[Math.max(current - 1, 0)] : PERCENT[current],
    currentLabel: closed
      ? status === "REJECTED"
        ? "Ticket rechazado"
        : "Ticket cancelado"
      : STAGES[current].label,
    closed,
  };
}
