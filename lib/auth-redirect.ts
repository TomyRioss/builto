import type { Role } from "@/app/generated/prisma/enums";

export function getPostLoginPath(role: Role, callbackUrl?: string | string[]) {
  if (typeof callbackUrl === "string" && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  return role === "DEV" ? "/dev/dashboard" : "/dashboard";
}
