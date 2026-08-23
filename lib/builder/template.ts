/**
 * Plantilla semilla de los sitios que genera la IA.
 *
 * Es el stack de Lovable: Vite + React + TypeScript + Tailwind + shadcn/ui.
 * Corre en Nodebox (Node real dentro del browser), con `npm install` de verdad:
 * la IA puede sumar dependencias reescribiendo `/package.json` y el sandbox las
 * instala sola.
 *
 * Las versiones NO son arbitrarias. Nodebox no puede cargar binarios nativos,
 * asi que todo lo que compila en Rust queda afuera (verificado uno por uno):
 *
 *   - Vite 8 usa Rolldown (Rust) -> "Cannot find native binding". Por eso
 *     `esbuild-wasm`, que es lo que hace funcionar a Vite aca.
 *   - Tailwind v4 usa @tailwindcss/oxide (Rust). Tailwind v3 es JS puro y anda.
 *     Lovable tambien genera Tailwind v3.
 *   - Next queda afuera por otro motivo: le faltan builtins a Nodebox
 *     ('dns/promises', 'node:inspector').
 *
 * Antes de subir cualquiera de estas versiones, probala: el fallo es silencioso
 * hasta que el sandbox no arranca.
 */

export const SANDBOX_TEMPLATE = "react-ts" as const;

/** Lo que corre el sandbox y donde vive la app. */
export const SANDBOX_ENVIRONMENT = "node" as const;
export const SANDBOX_ENTRY = "/src/main.tsx";

/** Archivo que se abre por defecto en el editor. */
export const ENTRY_FILE = "/src/App.tsx";

/**
 * Andamiaje: no se muestra en el explorador de archivos. `package.json` queda
 * visible a proposito — es donde el usuario ve que dependencias tiene.
 */
export const HIDDEN_FILES = [
  "/index.html",
  "/src/main.tsx",
  "/src/index.css",
  "/vite.config.js",
  "/tsconfig.json",
  "/tailwind.config.js",
  "/postcss.config.js",
];

const PACKAGE_JSON = {
  name: "sitio",
  private: true,
  version: "0.0.0",
  type: "module",
  scripts: {
    dev: "vite",
    build: "vite build",
  },
  dependencies: {
    react: "^19.0.0",
    "react-dom": "^19.0.0",
    "@radix-ui/react-slot": "^1.2.3",
    "class-variance-authority": "^0.7.1",
    clsx: "^2.1.1",
    "lucide-react": "^0.469.0",
    "react-icons": "^5.4.0",
    "tailwind-merge": "^2.6.0",
  },
  devDependencies: {
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    typescript: "^5.5.4",
    // Vite 4 exacto: Vite 5 arrastra Rollup 4, que es un binario nativo y
    // Nodebox no lo puede cargar ("architecture x32 is not supported").
    // Vite 4 usa Rollup 3, que es JS puro.
    vite: "4.2.0",
    // Sin esto Vite intenta cargar el esbuild nativo y el sandbox no arranca.
    "esbuild-wasm": "^0.17.12",
    tailwindcss: "^3.4.17",
    postcss: "^8.4.49",
    autoprefixer: "^10.4.20",
  },
};

export const STARTER_FILES: Record<string, string> = {
  "/package.json": `${JSON.stringify(PACKAGE_JSON, null, 2)}\n`,

  "/index.html": `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
    />
    <title>Sitio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>

    <!-- Captura del preview para las tarjetas del dashboard.

         El preview corre en un iframe cross-origin (Nodebox), asi que el
         parent no puede leer su DOM ni capturarlo. La captura se toma aca
         adentro y sale por postMessage; el parent la persiste. Tampoco sirve
         que el parent la pida: el iframe de la app esta anidado dentro del de
         Nodebox y no es alcanzable por DOM. Por eso se auto-dispara. -->
    <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
    <script>
      (function () {
        var SCALE = 0.5;
        var MIN_INTERVAL_MS = 15000;
        var DEBOUNCE_MS = 2500;
        var MAX_HEIGHT = 900;

        var busy = false;
        var lastAt = 0;
        var timer = null;

        function toDataUrl(canvas) {
          var webp = canvas.toDataURL("image/webp", 0.6);
          // Safari viejo ignora el mime y devuelve PNG, que pesa de mas.
          return webp.indexOf("data:image/webp") === 0
            ? webp
            : canvas.toDataURL("image/jpeg", 0.7);
        }

        function capture() {
          if (busy || !window.html2canvas) return;
          busy = true;
          lastAt = Date.now();

          window
            .html2canvas(document.body, {
              scale: SCALE,
              backgroundColor: "#ffffff",
              logging: false,
              useCORS: true,
              height: Math.min(document.documentElement.scrollHeight, MAX_HEIGHT),
            })
            .then(function (canvas) {
              // Canvas de 0px: el sitio todavia no tiene layout. Sin esto se
              // emite "data:," y el parent tiene que descartarlo.
              if (!canvas.width || !canvas.height) return;

              window.top.postMessage(
                { type: "builto:thumbnail", dataUrl: toDataUrl(canvas) },
                "*"
              );
            })
            .catch(function (error) {
              console.error("[builto] no se pudo capturar el preview", error);
            })
            .then(function () {
              busy = false;
            });
        }

        function schedule() {
          if (timer) clearTimeout(timer);
          var wait = Math.max(DEBOUNCE_MS, MIN_INTERVAL_MS - (Date.now() - lastAt));
          timer = setTimeout(capture, wait);
        }

        window.addEventListener("load", function () {
          schedule();
          // Lo que reescribe la IA entra por HMR, sin recargar: el observer es
          // lo que hace que la tarjeta refleje la ultima version.
          new MutationObserver(schedule).observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        });
      })();
    </script>
  </body>
</html>
`,

  // Configs en ESM. Vite escribe un vite.config.js.timestamp-*.mjs temporal
  // para leerlas y el fs de Nodebox no lo encuentra, asi que el preview loguea
  // un ENOENT — cosmetico, el server arranca igual y solo se ve en el overlay
  // de dev de Builto. Pasarlas a CommonJS lo saca, pero rompe el pipeline de
  // PostCSS y el sitio queda sin Tailwind (probado). Se queda en ESM.
  "/vite.config.js": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // El codigo fuente de shadcn/ui importa siempre "@/lib/utils". Sin este
  // alias, cualquier componente pegado tal cual de shadcn no resuelve y el
  // preview queda en blanco. La raiz del sandbox es "/", asi que "/src" ya es
  // la ruta absoluta: no hace falta node:url ni node:path (Nodebox no tiene
  // todos los builtins).
  resolve: {
    alias: { "@": "/src" },
  },
});
`,

  "/tsconfig.json": `${JSON.stringify(
    {
      compilerOptions: {
        target: "ESNext",
        lib: ["DOM", "DOM.Iterable", "ESNext"],
        module: "ESNext",
        moduleResolution: "Node",
        jsx: "react-jsx",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        isolatedModules: true,
        noEmit: true,
        // Espeja el alias de vite.config.js: sin esto el editor marca "@/..."
        // en rojo aunque el bundler lo resuelva bien.
        baseUrl: ".",
        paths: { "@/*": ["./src/*"] },
      },
      include: ["src"],
    },
    null,
    2,
  )}\n`,

  "/tailwind.config.js": `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Helvetica", "Open Sans", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
`,

  "/postcss.config.js": `export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
`,

  "/src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;
`,

  "/src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,

  "/src/lib/utils.ts": `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,

  "/src/components/ui/button.tsx": `import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-white hover:bg-neutral-800",
        outline: "border border-neutral-300 bg-white hover:bg-neutral-100",
        ghost: "hover:bg-neutral-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
`,

  [ENTRY_FILE]: `import { Button } from "./components/ui/button";

export default function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-4 md:px-10">
      <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">
        Tu sitio empieza aca
      </h1>
      <p className="max-w-[65ch] leading-6 text-neutral-600">
        Contale al chat que queres construir y esta pagina se va a ir armando en
        vivo mientras escribe.
      </p>
      <Button className="w-fit">Boton de ejemplo</Button>
    </main>
  );
}
`,
};

/**
 * Los starters son el piso: lo guardado en `ProjectFile` pisa lo que exista.
 */
export function withStarterFiles(saved: Record<string, string>): Record<string, string> {
  return { ...STARTER_FILES, ...saved };
}
