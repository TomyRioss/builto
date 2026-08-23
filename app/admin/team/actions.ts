"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageStaff } from "@/lib/permissions";

export type TeamActionState = { ok: boolean; error: string | null; invitePath?: string };
const roleSchema = z.enum(["DEV", "ADMIN"]);

function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function createStaffInvite(_previous: TeamActionState, formData: FormData): Promise<TeamActionState> {
  const session = await auth();
  if (!session?.user || !canManageStaff(session.user.role)) return { ok: false, error: "Solo el Owner puede invitar staff." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = roleSchema.safeParse(formData.get("role"));
  if (!z.email().safeParse(email).success || !role.success) return { ok: false, error: "Revisa el email y el rol." };
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { ok: false, error: "Ese email ya tiene una cuenta." };
  const rawToken = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.invite.updateMany({ where: { email, acceptedAt: null }, data: { expiresAt: new Date() } }),
    prisma.invite.create({ data: { email, role: role.data, token: tokenHash(rawToken), invitedById: session.user.id, expiresAt: new Date(Date.now() + 7 * 86_400_000) } }),
    prisma.auditLog.create({ data: { actorId: session.user.id, action: "staff.invited", entityType: "User", entityId: email, meta: { role: role.data } } }),
  ]);
  revalidatePath("/admin/team");
  return { ok: true, error: null, invitePath: `/register?invite=${encodeURIComponent(rawToken)}` };
}

export async function changeStaffRole(userId: string, roleInput: string): Promise<TeamActionState> {
  const session = await auth();
  if (!session?.user || !canManageStaff(session.user.role)) return { ok: false, error: "Solo el Owner puede cambiar roles." };
  const role = roleSchema.safeParse(roleInput);
  if (!role.success || userId === session.user.id) return { ok: false, error: "No podes modificar ese usuario." };
  const changed = await prisma.user.updateMany({ where: { id: userId, role: { in: ["DEV", "ADMIN"] } }, data: { role: role.data } });
  if (changed.count !== 1) return { ok: false, error: "El usuario ya no puede modificarse." };
  await prisma.auditLog.create({ data: { actorId: session.user.id, action: "user.role_changed", entityType: "User", entityId: userId, meta: { role: role.data } } });
  revalidatePath("/admin/team");
  return { ok: true, error: null };
}

export async function setStaffActive(userId: string, active: boolean): Promise<TeamActionState> {
  const session = await auth();
  if (!session?.user || !canManageStaff(session.user.role)) return { ok: false, error: "Solo el Owner puede cambiar accesos." };
  if (userId === session.user.id) return { ok: false, error: "No podes desactivar tu propia cuenta." };
  const changed = await prisma.user.updateMany({ where: { id: userId, role: { in: ["DEV", "ADMIN"] } }, data: { isActive: active } });
  if (changed.count !== 1) return { ok: false, error: "El usuario ya no puede modificarse." };
  await prisma.auditLog.create({ data: { actorId: session.user.id, action: active ? "user.activated" : "user.deactivated", entityType: "User", entityId: userId } });
  revalidatePath("/admin/team");
  return { ok: true, error: null };
}
