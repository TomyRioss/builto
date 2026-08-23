import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next 16 renombro middleware.ts -> proxy.ts y corre en runtime Node por
// defecto, asi que se puede reusar el `auth` de Auth.js tal cual.
const STAFF_ROLES = new Set(["DEV", "ADMIN", "OWNER"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  if (!user) {
    const login = new URL("/login", req.nextUrl);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  // El panel interno es grupo cerrado: DEV, ADMIN y OWNER.
  if ((pathname.startsWith("/admin") || pathname.startsWith("/dev")) && !STAFF_ROLES.has(user.role)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // El dashboard general pertenece al cliente. Un DEV trabaja exclusivamente
  // dentro de su espacio y tampoco puede entrar escribiendo la URL a mano.
  if (pathname.startsWith("/dashboard") && user.role === "DEV") {
    return NextResponse.redirect(new URL("/dev/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/dev/:path*"],
};
