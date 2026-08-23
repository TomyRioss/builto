import type { Role } from "@/app/generated/prisma/enums";

export function getPostLoginPath(role: Role, callbackUrl?: string | string[]) {
  if (typeof callbackUrl === "string" && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  if (role === "DEV") return "/dev/dashboard";
  if (role === "ADMIN" || role === "OWNER") return "/admin/dashboard";
  return "/dashboard";
}
