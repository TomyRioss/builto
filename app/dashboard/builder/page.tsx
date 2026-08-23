import { redirect } from "next/navigation";
import { LuSparkles } from "react-icons/lu";

import { auth } from "@/auth";
import { listConversations } from "@/lib/builder/queries";
import { NewConversationButton } from "@/app/components/builder/NewConversationButton";

/** Sin id: cae en el ultimo proyecto tocado, o en el estado vacio. */
export default async function BuilderIndexPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const [latest] = await listConversations(session.user.id);

  if (latest) redirect(`/dashboard/builder/${latest.id}`);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20 md:px-10">
      <div className="flex max-w-[65ch] flex-col items-start gap-6">
        <span className="flex size-10 items-center justify-center rounded-md bg-[#eef2ff] text-[#4648d4]">
          <LuSparkles className="size-5" aria-hidden />
        </span>

        <h1 className="text-3xl font-semibold leading-9 tracking-[-0.02em] text-[#191c1d]">
          Empeza tu primer sitio
        </h1>

        <p className="text-base leading-6 text-[#4c4546]">
          Describi lo que necesitas y la IA va a escribir los archivos del sitio. Los
          vas a ver renderizarse a la derecha mientras los escribe, y podes editarlos
          a mano cuando quieras.
        </p>

        <NewConversationButton />
      </div>
    </div>
  );
}
