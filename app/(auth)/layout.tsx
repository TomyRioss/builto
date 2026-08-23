import Image from "next/image";
import Link from "next/link";

import logo from "@/public/logotext-white.png";

export default function AuthLayout(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#ffffff] text-[#191c1d] md:flex-row">
      <aside className="flex shrink-0 flex-col justify-between bg-[#000000] px-6 py-10 text-[#ffffff] md:w-[42%] md:max-w-[520px] md:px-10 md:py-12">
        <Link href="/" aria-label="Builto, inicio">
          <Image src={logo} alt="Builto" priority className="h-11 w-auto md:h-12" />
        </Link>

        <div className="hidden md:block">
          <p className="max-w-[30ch] text-[32px] font-semibold leading-10 tracking-[-0.01em] text-balance">
            Describí tu sitio.{" "}
            <span className="whitespace-nowrap">Co-Build</span> lo construye.
          </p>
          <hr className="my-8 border-0 border-t border-[#474747]" />
          <p className="max-w-[46ch] text-base leading-6 text-[#c6c6c6] text-pretty">
            Y cuando la IA no alcanza, abrís un ticket y un dev de Builto entra
            al proyecto y lo edita a mano.
          </p>
        </div>

        <p className="mt-10 text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#848484] md:mt-0">
          IA + devs reales
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-12 md:px-10 md:py-20">
        <div className="w-full max-w-[380px]">{props.children}</div>
      </main>
    </div>
  );
}
