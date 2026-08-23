import type { Role } from "@/app/generated/prisma/enums";

// La jerarquia vive solo aca. Ningun componente decide permisos por su cuenta.
const RANK: Record<Role, number> = {
  USER: 0,
  DEV: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function atLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

/** Staff = grupo cerrado con acceso al panel interno (/admin). */
export function isStaff(role: Role): boolean {
  return atLeast(role, "DEV");
}

/** Cotizar y recotizar tickets: solo ADMIN y OWNER. */
export function canQuote(role: Role): boolean {
  return atLeast(role, "ADMIN");
}

/** Seccion Transacciones del panel (TOM-63): solo ADMIN y OWNER. */
export function canSeeTransactions(role: Role): boolean {
  return atLeast(role, "ADMIN");
}

/**
 * Leer conversaciones sin ser participante (historial de mensajes de toda la
 * app). Cada lectura se registra en AuditLog desde el server action.
 */
export function canAuditMessages(role: Role): boolean {
  return atLeast(role, "ADMIN");
}

/** Historial de acciones de devs: solo OWNER y ADMIN. */
export function canSeeAuditLog(role: Role): boolean {
  return atLeast(role, "ADMIN");
}

/** Cambiar roles e invitar staff: solo OWNER. */
export function canManageStaff(role: Role): boolean {
  return atLeast(role, "OWNER");
}
