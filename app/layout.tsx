import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Builto — Tu web con IA y desarrolladores humanos",
  description:
    "Creá tu sitio con inteligencia artificial y el respaldo de desarrolladores profesionales.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        {/* Vite, corriendo dentro de Nodebox (el sandbox del builder), pide un
            `vite.config.js.timestamp-*.mjs` temporal que el fs virtual no
            tiene. El server del sandbox arranca igual: es ruido, no un fallo.

            Nodebox lo tira como promesa rechazada sin catch. Next escucha
            `unhandledrejection` al arrancar su runtime y lo cuenta como issue
            del overlay de dev, asi que un listener montado desde un componente
            llega tarde: corre despues y el issue ya quedo contado. Este script
            es inline en el <head>, se ejecuta al parsear el documento —
            antes que el bundle de Next— y con stopImmediatePropagation corta
            la cadena antes de que Next lo vea.

            El filtro es por mensaje exacto a proposito: cualquier otro
            unhandledrejection tiene que seguir llegando al overlay. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){window.addEventListener("unhandledrejection",function(e){var m=e.reason&&e.reason.message||String(e.reason||"");if(m.indexOf("Failed to stat file")===-1)return;if(m.indexOf("vite.config.js.timestamp-")===-1)return;e.stopImmediatePropagation();e.preventDefault();console.warn("[builder] ENOENT esperado de Vite en Nodebox, ignorado:",m);},true);})();`,
          }}
        />
      </head>
      <body className="h-full flex flex-col overflow-y-auto">{children}</body>
    </html>
  );
}
