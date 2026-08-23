import { LuSparkles, LuTicket, LuUser } from "react-icons/lu";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listActivity } from "@/lib/dashboard/activity";
import { formatRelativeTime } from "@/lib/utils";
import { SignOutButton } from "./SignOutButton";

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google",
  credentials: "Email y contraseña",
};

export default async function AccountPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [user, accounts, activity] = userId
    ? await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true, image: true, createdAt: true },
        }),
        prisma.account.findMany({
          where: { userId },
          select: { provider: true },
        }),
        listActivity(userId, 5),
      ])
    : [null, [], []];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-10">
      <h1 className="text-2xl font-semibold leading-8 tracking-[-0.01em] md:text-[32px] md:leading-10">
        Mi cuenta
      </h1>
      <p className="mt-2 text-sm leading-5 text-[#4c4546]">
        Tu perfil, conexiones y actividad reciente.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {/* Perfil */}
        <section>
          <h2 className="text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
            Perfil
          </h2>
          <div className="mt-3 flex items-center gap-4 rounded-lg border border-[#cfc4c5] bg-[#ffffff] px-4 py-5 md:px-6">
            {user?.image ? (
              // Avatar de proveedor OAuth: dominio externo variable, next/image no aporta aca.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? user.email ?? "Avatar"}
                className="size-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#e1e3e4] text-[#4c4546]">
                <LuUser className="size-6" aria-hidden />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-base font-medium leading-6">
                {user?.name ?? "Sin nombre"}
              </p>
              <p className="truncate text-sm leading-5 text-[#4c4546]">{user?.email}</p>
              {user?.createdAt && (
                <p className="mt-1 text-xs leading-4 text-[#7e7576]">
                  Miembro desde {formatRelativeTime(user.createdAt)}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Conexiones */}
        <section>
          <h2 className="text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
            Conexiones
          </h2>
          <div className="mt-3 divide-y divide-[#cfc4c5] rounded-lg border border-[#cfc4c5] bg-[#ffffff]">
            <div className="flex items-center justify-between px-4 py-5 md:px-6">
              <div>
                <p className="text-sm font-medium leading-5">Email y contraseña</p>
                <p className="mt-1 text-sm leading-5 text-[#4c4546]">{user?.email}</p>
              </div>
              <span className="rounded bg-[#e1e3e4] px-2 py-1 text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#000000]">
                Activa
              </span>
            </div>
            {accounts.map((acc) => (
              <div key={acc.provider} className="flex items-center justify-between px-4 py-5 md:px-6">
                <p className="text-sm font-medium leading-5">
                  {PROVIDER_LABEL[acc.provider] ?? acc.provider}
                </p>
                <span className="rounded border border-[#c0c1ff] bg-[#eef2ff] px-2 py-1 text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#4648d4]">
                  Conectada
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Actividad */}
        <section>
          <h2 className="text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
            Actividad reciente
          </h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-[#cfc4c5] bg-[#ffffff]">
            {activity.length === 0 ? (
              <p className="p-4 text-sm leading-5 text-[#4c4546]">
                Todavía no hay actividad.
              </p>
            ) : (
              <ul className="divide-y divide-[#cfc4c5]">
                {activity.map((item) => {
                  const Icon = item.kind === "ai" ? LuSparkles : LuTicket;
                  return (
                    <li key={item.id} className="p-4">
                      <div className="flex gap-4">
                        <span
                          className={
                            "flex size-8 shrink-0 items-center justify-center rounded-full " +
                            (item.kind === "ai"
                              ? "bg-[#eef2ff] text-[#4648d4]"
                              : "bg-[#e1e3e4] text-[#4c4546]")
                          }
                        >
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm leading-5 text-[#000000]">{item.text}</p>
                          <p className="mt-2 text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#4c4546]">
                            {formatRelativeTime(item.at)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8">
        <SignOutButton />
      </div>
    </div>
  );
}
