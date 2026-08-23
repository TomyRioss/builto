import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const execFileAsync = promisify(execFile);

/**
 * Compila el proyecto Vite+React+TS+Tailwind del usuario con Vite de verdad,
 * corriendo en el server (Node real, misma red que ya probamos que anda).
 * Reemplaza a Sandpack/Nodebox: nada de esto depende del browser del usuario
 * ni de bundlers en la nube de terceros, asi que CSP/cookies/extensiones del
 * cliente no pueden romperlo.
 *
 * `base/` es un mini-proyecto npm compartido con las dependencias fijas del
 * stack (react, tailwind, vite, etc), instalado una sola vez. Cada proyecto
 * de usuario escribe su codigo en `base/live/<projectId>/` y hereda
 * `node_modules` de `base/` por resolucion natural de Node (busca hacia
 * arriba) — sin symlinks, portable en Windows.
 */
const SANDBOX_ROOT = path.join(process.cwd(), ".builder-sandbox");
const BASE_DIR = path.join(SANDBOX_ROOT, "base");
const LIVE_DIR = path.join(BASE_DIR, "live");

const BASE_PACKAGE_JSON = {
  name: "builder-sandbox-base",
  private: true,
  version: "0.0.0",
  dependencies: {
    react: "^19.0.0",
    "react-dom": "^19.0.0",
    "@radix-ui/react-slot": "^1.2.3",
    "class-variance-authority": "^0.7.1",
    clsx: "^2.1.1",
    "lucide-react": "^0.469.0",
    "react-icons": "^5.4.0",
    "react-router-dom": "^6.28.0",
    "tailwind-merge": "^2.6.0",
  },
  devDependencies: {
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    typescript: "^5.5.4",
    vite: "4.2.0",
    tailwindcss: "^3.4.17",
    postcss: "^8.4.49",
    autoprefixer: "^10.4.20",
  },
};

let baseReadyPromise: Promise<void> | null = null;

/** Instala las dependencias fijas una sola vez (persiste entre requests). */
function ensureBaseSandbox(): Promise<void> {
  if (!baseReadyPromise) {
    baseReadyPromise = (async () => {
      await mkdir(BASE_DIR, { recursive: true });
      const pkgPath = path.join(BASE_DIR, "package.json");
      await writeFile(pkgPath, JSON.stringify(BASE_PACKAGE_JSON, null, 2));

      if (existsSync(path.join(BASE_DIR, "node_modules", "vite"))) return;

      console.info("[builder] instalando dependencias base del sandbox (una sola vez)...");
      await execFileAsync("npm", ["install", "--no-audit", "--no-fund"], {
        cwd: BASE_DIR,
        shell: process.platform === "win32",
        maxBuffer: 20 * 1024 * 1024,
      });
      console.info("[builder] sandbox base listo");
    })().catch((error) => {
      baseReadyPromise = null;
      throw error;
    });
  }
  return baseReadyPromise;
}

async function writeProjectFiles(projectDir: string, files: Record<string, string>) {
  await rm(projectDir, { recursive: true, force: true });
  await mkdir(projectDir, { recursive: true });

  for (const [filePath, content] of Object.entries(files)) {
    const relative = filePath.replace(/^\//, "");
    const absolute = path.join(projectDir, relative);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, content);
  }
}

async function runViteBuild(projectDir: string): Promise<void> {
  const viteBin = path.join(BASE_DIR, "node_modules", "vite", "bin", "vite.js");
  await execFileAsync("node", [viteBin, "build", "--outDir", "dist", "--emptyOutDir", "--logLevel", "warn"], {
    cwd: projectDir,
    maxBuffer: 20 * 1024 * 1024,
    timeout: 60_000,
  });
}

/**
 * Inlinea los assets del build (JS/CSS con hash) en un solo HTML
 * autocontenido, como `data:` URI en base64.
 *
 * Probamos primero pegar el codigo tal cual dentro de <script>/<style>: el
 * bundle de React trae strings con "<style", "<body>", "<html" (el propio
 * codigo fuente de React los menciona), y esos substrings rompian el parser
 * HTML del navegador sin importar cuanto escapabamos "</script". Base64 solo
 * usa [A-Za-z0-9+/=] — no hay forma de que rompa el HTML alrededor.
 */
async function inlineBuildOutput(projectDir: string): Promise<string> {
  const distDir = path.join(projectDir, "dist");
  let html = await readFile(path.join(distDir, "index.html"), "utf8");

  // El orden/presencia de atributos (crossorigin, etc) varia entre versiones
  // de Vite: matchea el tag completo por su `src=`/`href=` a /assets/*, sin
  // asumir el orden de los atributos vecinos.
  const scriptTag = /<script\b[^>]*\bsrc="\/?(assets\/[^"]+\.js)"[^>]*>\s*<\/script>/g;
  const linkTag = /<link\b[^>]*\bhref="\/?(assets\/[^"]+\.css)"[^>]*\/?>/g;

  for (const match of [...html.matchAll(scriptTag)]) {
    const code = await readFile(path.join(distDir, match[1]));
    const dataUrl = `data:text/javascript;base64,${code.toString("base64")}`;
    html = html.replace(match[0], `<script type="module" src="${dataUrl}"></script>`);
  }

  for (const match of [...html.matchAll(linkTag)]) {
    const code = await readFile(path.join(distDir, match[1]));
    const dataUrl = `data:text/css;base64,${code.toString("base64")}`;
    html = html.replace(match[0], `<link rel="stylesheet" href="${dataUrl}">`);
  }

  return html;
}

export type BuildResult =
  | { ok: true; html: string }
  | { ok: false; error: string };

/** Compila el proyecto y devuelve el HTML final listo para servir en un iframe. */
export async function buildProjectPreview(
  projectId: string,
  files: Record<string, string>,
): Promise<BuildResult> {
  try {
    await ensureBaseSandbox();

    const projectDir = path.join(LIVE_DIR, projectId);
    await writeProjectFiles(projectDir, files);
    await runViteBuild(projectDir);
    const html = await inlineBuildOutput(projectDir);

    return { ok: true, html };
  } catch (error) {
    const message =
      error && typeof error === "object" && "stderr" in error
        ? String((error as { stderr?: unknown }).stderr)
        : error instanceof Error
          ? error.message
          : String(error);

    console.error("[builder] fallo el build del sandbox", { projectId, message });
    return { ok: false, error: message.slice(0, 4000) };
  }
}
