"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { LuCode, LuDownload, LuEye, LuLoader, LuPlus, LuUpload, LuX } from "react-icons/lu";
import { toast } from "sonner";
import type { SandpackError } from "@codesandbox/sandpack-client";

import { importProjectFiles, saveProjectFile, saveProjectThumbnail } from "@/app/dashboard/builder/actions";
import { NewTicketDialog } from "@/app/components/tickets/NewTicketDialog";
import { normalizePath } from "@/lib/builder/protocol";
import {
  ENTRY_FILE,
  HIDDEN_FILES,
  SANDBOX_ENTRY,
  SANDBOX_ENVIRONMENT,
  SANDBOX_TEMPLATE,
} from "@/lib/builder/template";

const SAVE_DEBOUNCE_MS = 800;

/** Mensajes que rotan mientras el sandbox instala/bundlea. Mezcla de chiste y jerga real. */
const LOADING_MESSAGES = [
  "Cargando obra maestra",
  "Codificando asombro",
  "Renderizando frontend",
  "Compilando genialidad",
  "Resolviendo promesas",
  "Convenciendo al bundler",
  "Instalando node_modules (de nuevo)",
  "Buscando el punto y coma",
  "Invocando al garbage collector",
  "Negociando con Webpack",
  "Calentando la CPU",
  "Corriendo npm install, paciencia",
  "Haciendo magia con Vite",
  "Alineando los divs",
  "Silenciando warnings de TypeScript",
  "Centrando un div (dificil, ya sabemos)",
  "Buscando por que funciona en mi maquina",
  "Desenredando el spaghetti de CSS",
  "Preguntandole a Stack Overflow",
  "Esperando que nadie toque producción",
  "Haciendo las paces con las dependencias",
  "Persiguiendo un pixel rebelde",
  "Convenciendo al responsive de cooperar",
  "Traduciendo diseño a componentes",
  "Revisando que el botón haga algo",
  "Quitando el console.log de prueba",
  "Contando divs innecesarios",
  "Acomodando el caos con flexbox",
  "Dándole café al servidor",
  "Buscando el cierre de la etiqueta",
  "Haciendo que todo entre en mobile",
  "Negociando con los márgenes",
  "Poniendo los píxeles en fila",
  "Validando que no sea otro z-index",
  "Casi listo, no muevas nada",
];

/** Easter egg: chance minima de reemplazar el mensaje normal en cada tick. */
const EASTER_EGG_MESSAGE = "Farmeando aura";
const EASTER_EGG_CHANCE = 0.02;

const MESSAGE_INTERVAL_MS = 2200;
const DOT_INTERVAL_MS = 450;

/** Caras de un cubo 3D: cada una es la cara de un cubo de 72px desplazada/rotada desde el centro. */
const CUBE_HALF = "36px";
const CUBE_FACES = [
  { transform: `rotateY(0deg) translateZ(${CUBE_HALF})` }, // front
  { transform: `rotateY(180deg) translateZ(${CUBE_HALF})` }, // back
  { transform: `rotateY(90deg) translateZ(${CUBE_HALF})` }, // right
  { transform: `rotateY(-90deg) translateZ(${CUBE_HALF})` }, // left
  { transform: `rotateX(90deg) translateZ(${CUBE_HALF})` }, // top
  { transform: `rotateX(-90deg) translateZ(${CUBE_HALF})` }, // bottom
];

type Props = {
  projectId: string;
  projectName: string;
  files: Record<string, string>;
  writingPath: string | null;
  isStreaming: boolean;
  initialTab?: "preview" | "code";
  allowImport?: boolean;
  readOnly?: boolean;
};

/**
 * Margen para que `router.refresh()` traiga los archivos definitivos despues de
 * que termina el stream. Si no llegan en ese plazo, se recompila igual.
 */
const RERUN_FALLBACK_MS = 2000;

export default function PreviewPanel({
  projectId,
  projectName,
  files,
  writingPath,
  isStreaming,
  initialTab = "preview",
  allowImport = false,
  readOnly = false,
}: Props) {
  const [tab, setTab] = useState<"preview" | "code">(initialTab);

  useThumbnailCapture(projectId);

  // Sandpack resetea el sandbox entero (y con Nodebox eso es `npm install` de
  // nuevo, ~1 min en blanco) cada vez que cambia la IDENTIDAD de `files`,
  // `customSetup` u `options` — ver useFiles en sandpack-react. Por eso se
  // monta una sola vez con el snapshot inicial y props congeladas; lo que
  // escribe la IA despues entra en caliente por updateFile (FileSync).
  const [mountFiles] = useState(files);
  const [mountSetup] = useState(() => ({
    environment: SANDBOX_ENVIRONMENT,
    entry: SANDBOX_ENTRY,
  }));
  const [mountOptions] = useState(() => ({
    activeFile: ENTRY_FILE,
    visibleFiles: visibleFiles(files),
    // Nodebox corre npm install de verdad: en frio son ~50s.
    bundlerTimeOut: 240_000,
  }));

  const previewScopeRef = useRef<HTMLDivElement>(null);
  const bundlerLoading = useBundlerLoading(previewScopeRef);
  const runtimeError = useRuntimeError(isStreaming);
  // `.sp-loading` vive adentro del iframe de Nodebox: en una recompilacion
  // grande (npm install de una dependencia nueva, muchos archivos juntos) no
  // siempre se ve desde afuera y el preview queda en blanco sin aviso. Esto
  // se prende a mano alrededor del runSandpack() real, sin depender del DOM.
  const [recompiling, setRecompiling] = useState(false);
  // Cubrimos la transicion desde el inicio del turno: Sandpack puede dejar el
  // iframe en blanco antes de que su estado de carga o la recompilacion sean
  // observables desde afuera.
  const showLoadingOverlay = bundlerLoading || recompiling || isStreaming;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8f9fa]">
      <header className="flex items-center gap-2 border-b border-[#cfc4c5] bg-[#ffffff] px-4 py-3">
        <TabButton active={tab === "preview"} onClick={() => setTab("preview")} Icon={LuEye}>
          Preview
        </TabButton>
        <TabButton active={tab === "code"} onClick={() => setTab("code")} Icon={LuCode}>
          Codigo
        </TabButton>

        <NewTicketDialog
          projects={[{ id: projectId, name: projectName, thumbnail: null }]}
        />

        {writingPath && (
          <span className="ml-auto flex items-center gap-2 text-xs font-medium text-[#4648d4]">
            <LuLoader className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
            Escribiendo {writingPath}
          </span>
        )}
      </header>

      {/*
        Sandpack solo muestra su propio cubo cuando sandpack.status === "running";
        durante "initial" (la mayor parte del npm install) su overlay queda oculto.
        Por eso dibujamos nuestro propio cubo en BundlerLoadingText en vez de
        depender del markup interno (clases sp-*) de Sandpack.
      */}
      <style jsx global>{`
        @keyframes preview-cube-spin {
          from {
            transform: rotateX(-25deg) rotateY(0deg);
          }
          to {
            transform: rotateX(-25deg) rotateY(360deg);
          }
        }
      `}</style>

      <div
        ref={previewScopeRef}
        className="sandpack-preview-scope relative min-h-0 flex-1"
      >
        {isStreaming && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[80] h-0.5 origin-left bg-[#6063ee] shadow-[0_0_10px_rgba(96,99,238,0.7)] motion-safe:animate-[preview-progress_1.4s_ease-in-out_infinite]"
            role="progressbar"
            aria-label="Generando preview"
          />
        )}
        {showLoadingOverlay && <BundlerLoadingText />}

        <SandpackProvider
          template={SANDBOX_TEMPLATE}
          files={mountFiles}
          customSetup={mountSetup}
          options={mountOptions}
          style={{ height: "100%" }}
        >
          <PreviewErrorOverlay bundlerLoading={showLoadingOverlay} runtimeError={runtimeError} />

          <FileSync
            projectId={projectId}
            externalFiles={files}
            isStreaming={isStreaming}
            onRecompilingChange={setRecompiling}
          />

          <SandpackLayout
            style={{
              height: "100%",
              border: "none",
              borderRadius: 0,
              background: "transparent",
            }}
          >
            {/* Los dos quedan montados y se alternan con display: desmontar el
                preview obliga a Sandpack a re-bundlear todo el sandbox. */}
            <SandpackPreview
              showOpenInCodeSandbox={false}
              showRefreshButton
              style={{ height: "100%", display: tab === "preview" ? "flex" : "none" }}
            />
            {/* autoHiddenFiles deja solo visibleFiles: sin esto el usuario ve
                package.json, tsconfig y demas andamiaje del sandbox. */}
            <div
              className="flex min-h-0 flex-col border-r border-[#cfc4c5]"
              style={{ display: tab === "code" ? "flex" : "none" }}
            >
              {!readOnly && <NewFileControl />}
              <SandpackFileExplorer autoHiddenFiles style={{ flex: 1, minHeight: 0 }} />
              {!readOnly && <CodeTransferControls projectId={projectId} allowImport={allowImport} />}
            </div>
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              closableTabs
              readOnly={readOnly}
              style={{ height: "100%", display: tab === "code" ? "flex" : "none" }}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </section>
  );
}

/** Necesita estar dentro de SandpackProvider para leer sandpack.error/runSandpack. */
function PreviewErrorOverlay({
  bundlerLoading,
  runtimeError,
}: {
  bundlerLoading: boolean;
  runtimeError: string | null;
}) {
  const { sandpack } = useSandpack();
  if (bundlerLoading) return null;
  if (sandpack.error) return <PreviewError error={sandpack.error} onRetry={sandpack.runSandpack} />;
  if (runtimeError) return <PreviewError error={{ message: runtimeError }} onRetry={sandpack.runSandpack} />;
  return null;
}

/**
 * Escucha las excepciones de runtime que reporta `RUNTIME_ERROR_SCRIPT` (ver
 * template.ts) desde el iframe del sandbox. `sandpack.error` no las cubre:
 * son errores de React/JS en el browser, no del bundler, y sin esto el
 * usuario se queda mirando un iframe en blanco sin ningun aviso.
 */
function useRuntimeError(isStreaming: boolean) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isStreaming) return;
    const timer = setTimeout(() => setError(null), 0);
    return () => clearTimeout(timer);
  }, [isStreaming]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (typeof data !== "object" || data === null || (data as { type?: unknown }).type !== "builto:runtime-error") return;
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string") setError(message);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return error;
}

function NewFileControl() {
  const { sandpack } = useSandpack();
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("/src/");

  function create(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizePath(path);
    if (!normalized || normalized === "/" || HIDDEN_FILES.includes(normalized)) {
      toast.error("Elegi una ruta valida dentro del proyecto.");
      return;
    }
    if (sandpack.files[normalized]) {
      toast.error("Ese archivo ya existe.");
      return;
    }
    sandpack.addFile(normalized, "");
    sandpack.openFile(normalized);
    setOpen(false);
    setPath("/src/");
  }

  return (
    <div className="border-b border-[#cfc4c5] p-2">
      {open ? (
        <form onSubmit={create} className="flex items-center gap-1">
          <input
            autoFocus
            value={path}
            onChange={(event) => setPath(event.target.value)}
            aria-label="Ruta del archivo nuevo"
            className="h-8 min-w-0 flex-1 rounded border border-[#cfc4c5] bg-white px-2 text-xs outline-none focus:border-[#4648d4]"
            placeholder="/src/components/Nuevo.tsx"
          />
          <button
            type="submit"
            className="grid size-8 shrink-0 place-items-center rounded bg-black text-white"
            title="Crear archivo"
          >
            <LuPlus className="size-4" />
            <span className="sr-only">Crear archivo</span>
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-8 shrink-0 place-items-center rounded text-[#666768] hover:bg-[#eceeef]"
            title="Cancelar"
          >
            <LuX className="size-4" />
            <span className="sr-only">Cancelar</span>
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-8 w-full items-center justify-center gap-2 rounded text-xs font-medium text-[#4c4546] hover:bg-[#eceeef]"
        >
          <LuPlus className="size-4" />
          Nuevo archivo
        </button>
      )}
    </div>
  );
}

/** Zippea los archivos visibles del sandbox y dispara la descarga. */
function CodeTransferControls({ projectId, allowImport }: { projectId: string; allowImport: boolean }) {
  return (
    <div className="grid grid-cols-1 border-t border-[#cfc4c5] bg-white">
      {allowImport && <ImportCodeButton projectId={projectId} />}
      <ExportCodeButton />
    </div>
  );
}

const BINARY_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "ico", "pdf", "zip", "woff", "woff2", "ttf", "eot", "mp3", "mp4", "webm",
]);

function ImportCodeButton({ projectId }: { projectId: string }) {
  const { sandpack } = useSandpack();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(file: File) {
    setImporting(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files).filter((entry) => {
        const path = entry.name.replaceAll("\\", "/");
        const extension = path.split(".").pop()?.toLowerCase() ?? "";
        return !entry.dir
          && !path.split("/").some((part) => part === "node_modules" || part === ".git" || part === ".next")
          && !BINARY_EXTENSIONS.has(extension);
      });
      if (entries.length === 0) throw new Error("EMPTY_ZIP");

      const firstSegments = entries.map((entry) => entry.name.replaceAll("\\", "/").split("/")[0]);
      const commonRoot = firstSegments.every((segment) => segment === firstSegments[0])
        && entries.every((entry) => entry.name.replaceAll("\\", "/").includes("/"))
        ? `${firstSegments[0]}/`
        : "";

      const files = await Promise.all(entries.map(async (entry) => ({
        path: normalizePath(entry.name.replaceAll("\\", "/").slice(commonRoot.length)),
        content: await entry.async("string"),
      })));
      const result = await importProjectFiles({ projectId, files });
      if (!result.ok) {
        toast.error(result.error ?? "No pudimos guardar los archivos importados.");
        return;
      }

      const importedPaths = new Set(files.map((item) => item.path));
      for (const item of files) {
        if (sandpack.files[item.path]) sandpack.updateFile(item.path, item.content);
        else sandpack.addFile(item.path, item.content);
      }
      const nextActive = importedPaths.has(ENTRY_FILE) ? ENTRY_FILE : files[0].path;
      sandpack.openFile(nextActive);
      for (const path of Object.keys(sandpack.files)) {
        if (!HIDDEN_FILES.includes(path) && !importedPaths.has(path)) sandpack.deleteFile(path);
      }
      toast.success(`${files.length} archivos importados correctamente.`);
      void sandpack.runSandpack().catch(() => {
        toast.warning("Los archivos se guardaron, pero el preview tiene errores de compilacion.");
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      console.warn("[builder] ZIP rechazado antes de guardarse", { projectId, message });
      toast.error(
        message === "EMPTY_ZIP"
          ? "El ZIP no contiene codigo importable."
          : message || "No pudimos leer el ZIP. Verifica que no este dañado.",
      );
    } finally {
      setImporting(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={importing}
        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#191c1d] hover:bg-[#edeeef] disabled:opacity-60"
      >
        {importing ? <LuLoader className="size-4 animate-spin" aria-hidden /> : <LuUpload className="size-4" aria-hidden />}
        {importing ? "Importando..." : "Importar ZIP"}
      </button>
    </>
  );
}

function ExportCodeButton() {
  const { sandpack } = useSandpack();
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      for (const path of visibleFiles(
        Object.fromEntries(Object.entries(sandpack.files).map(([p, f]) => [p, f.code])),
      )) {
        zip.file(path.replace(/^\//, ""), sandpack.files[path]?.code ?? "");
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "proyecto.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[builder] no se pudo exportar el codigo", { error });
      toast.error("No pudimos exportar el codigo.");
    } finally {
      setExporting(false);
    }
  }, [sandpack.files]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 border-t border-[#cfc4c5] px-4 py-3 text-sm font-medium text-[#191c1d] hover:bg-[#edeeef] disabled:opacity-60"
    >
      {exporting ? (
        <LuLoader className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
      ) : (
        <LuDownload className="size-4" aria-hidden />
      )}
      Exportar codigo
    </button>
  );
}

/**
 * Sandpack no expone si esta bundleando/instalando como prop publica; el
 * overlay `.sp-loading` se monta y desmonta solo mientras dura. Observamos
 * el DOM en vez de pelear con su estado interno (mas confiable que
 * sandpack.status/listen(), que puede quedarse pegado sin emitir "done").
 */
function useBundlerLoading(scopeRef: React.RefObject<HTMLDivElement | null>) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;

    const check = () => setLoading(root.querySelector(".sp-loading") !== null);
    check();

    const observer = new MutationObserver(check);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [scopeRef]);

  return loading;
}

/** Texto grande sobre el cubo: rotula el mensaje cada tanto, puntos suspensivos animados. */
function BundlerLoadingText() {
  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * LOADING_MESSAGES.length),
  );
  const [easterEgg, setEasterEgg] = useState(false);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setEasterEgg(Math.random() < EASTER_EGG_CHANCE);
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, DOT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[70] flex flex-col items-center justify-center gap-4"
      style={{ background: "rgba(248, 249, 250, 0.82)", backdropFilter: "blur(10px)" }}
    >
      <div className="size-[72px]" style={{ perspective: "360px" }} aria-hidden>
        <div
          className="relative size-full"
          style={{
            transformStyle: "preserve-3d",
            animation: "preview-cube-spin 2.4s linear infinite",
          }}
        >
          {CUBE_FACES.map(({ transform }, i) => (
            <div
              key={i}
              className="absolute inset-0 border border-[#4648d4] bg-[#eef2ff]"
              style={{ transform }}
            />
          ))}
        </div>
      </div>
      <p className="ml-4 whitespace-nowrap text-center text-xl font-semibold tracking-[-0.01em] text-[#191c1d]">
        {easterEgg ? EASTER_EGG_MESSAGE : LOADING_MESSAGES[messageIndex]}
        <span className="inline-block w-6 text-left">{".".repeat(dotCount)}</span>
      </p>
    </div>
  );
}

function PreviewError({ error, onRetry }: { error: SandpackError; onRetry: () => Promise<void> }) {
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-[75] flex items-center justify-center bg-[#f8f9fa]/95 p-6">
      <div className="w-full max-w-lg rounded-xl border border-[#e8caca] bg-white p-6 shadow-[0_18px_45px_-28px_rgba(127,29,29,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b42318]">No se pudo renderizar</p>
        <h2 className="mt-2 text-lg font-semibold text-[#191c1d]">Hay un error en el código generado</h2>
        <p className="mt-3 break-words font-mono text-xs leading-5 text-[#6b4b4b]">
          {error.path ? `${error.path}${error.line ? `:${error.line}` : ""}` : "Preview"}
          {error.message ? `: ${error.message}` : ""}
        </p>
        <button
          type="button"
          onClick={retry}
          disabled={retrying}
          className="mt-5 rounded-md bg-[#4648d4] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3537b8] disabled:cursor-progress disabled:opacity-60"
        >
          {retrying ? "Recompilando..." : "Reintentar preview"}
        </button>
      </div>
    </div>
  );
}

function visibleFiles(files: Record<string, string>) {
  return Object.keys(files).filter((path) => !HIDDEN_FILES.includes(path));
}

function TabButton({
  active,
  onClick,
  Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium ${
        active
          ? "bg-[#eef2ff] text-[#4648d4]"
          : "text-[#4c4546] hover:bg-[#edeeef] hover:text-[#191c1d]"
      }`}
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </button>
  );
}

/**
 * Persiste lo que el usuario escribe a mano en el editor.
 *
 * Deliberadamente NO devuelve el cambio al prop `files`: hacerlo re-sincroniza
 * los archivos internos de Sandpack, el editor vuelve a emitir, y se cuelga en
 * "Maximum update depth exceeded". Mientras el usuario edita, la fuente de
 * verdad es Sandpack; la DB se pone al dia con el debounce y el prop recien en
 * el proximo router.refresh().
 */
function FileSync({
  projectId,
  externalFiles,
  isStreaming,
  onRecompilingChange,
}: {
  projectId: string;
  externalFiles: Record<string, string>;
  isStreaming: boolean;
  onRecompilingChange: (loading: boolean) => void;
}) {
  const { sandpack } = useSandpack();
  const { activeFile } = sandpack;
  const code = sandpack.files[activeFile]?.code;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (path: string, content: string) => {
      try {
        const result = await saveProjectFile({ projectId, path, content });
        if (!result.ok) {
          console.error("[builder] el guardado manual fue rechazado", {
            projectId,
            path,
            error: result.error,
          });
          toast.error(result.error ?? "No pudimos guardar el archivo.");
        }
      } catch (error) {
        console.error("[builder] no se pudo guardar el archivo editado", {
          projectId,
          path,
          error,
        });
        toast.error("No pudimos guardar el archivo.");
      }
    },
    [projectId],
  );

  // Lo que escribe la IA entra en caliente, archivo por archivo. Pasarlo por
  // el prop `files` del provider reinicia el sandbox entero (npm install de
  // nuevo, preview en blanco); updateFile solo re-bundlea lo que cambio.
  const sandpackRef = useRef(sandpack);

  useEffect(() => {
    sandpackRef.current = sandpack;
  }, [sandpack]);

  /**
   * Recompilacion pendiente.
   *
   * Durante el stream los archivos llegan de a uno: si la IA escribe App.tsx
   * antes que los componentes que importa, el bundler compila un import roto,
   * queda en estado de error y NO se recupera solo cuando el archivo que
   * faltaba aparece — el preview se queda en blanco hasta un refresh manual.
   * Al cerrar el turno se fuerza un runSandpack() con el set completo, que es
   * lo mismo que hace ese refresh pero sin reinstalar npm.
   */
  const rerunPendingRef = useRef(false);
  const rerunTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rerun = useCallback(() => {
    if (!rerunPendingRef.current) return;
    rerunPendingRef.current = false;

    if (rerunTimerRef.current) {
      clearTimeout(rerunTimerRef.current);
      rerunTimerRef.current = null;
    }

    const startedAt = performance.now();
    onRecompilingChange(true);

    sandpackRef.current
      .runSandpack()
      .then(() => {
        console.info("[builder] preview recompilado", {
          projectId,
          durationMs: Math.round(performance.now() - startedAt),
        });
      })
      .catch((error) => {
        console.error("[builder] no se pudo recompilar el sandbox", {
          projectId,
          durationMs: Math.round(performance.now() - startedAt),
          error,
        });
        toast.error("El preview quedo desactualizado. Recargalo con el boton de refresh.");
      })
      .finally(() => onRecompilingChange(false));
  }, [projectId, onRecompilingChange]);

  useEffect(() => {
    if (isStreaming) {
      rerunPendingRef.current = true;
      return;
    }
    if (!rerunPendingRef.current) return;

    // El aviso arranca ya (el turno termino, el preview todavia muestra la
    // version vieja), no recien cuando arranca runSandpack() 2s despues.
    onRecompilingChange(true);

    // Espera un tick para que updateFile termine de actualizar el estado interno
    // de Sandpack antes de iniciar el bundler.
    rerunTimerRef.current = setTimeout(rerun, RERUN_FALLBACK_MS);

    return () => {
      if (rerunTimerRef.current) clearTimeout(rerunTimerRef.current);
    };
  }, [isStreaming, rerun, onRecompilingChange]);

  // Cambio de proyecto: el host mantiene un unico SandpackProvider vivo entre
  // conversaciones (ver BuilderPreviewHost), asi que no hay remount que se
  // encargue de esto solo. Se borran los archivos que no pertenecen al nuevo
  // proyecto y se pisan/agregan el resto, en vez de reinstalar el sandbox.
  const prevProjectIdRef = useRef(projectId);

  useEffect(() => {
    if (prevProjectIdRef.current === projectId) return;
    prevProjectIdRef.current = projectId;

    const current = sandpackRef.current;
    const nextPaths = new Set(Object.keys(externalFiles));
    const stale = Object.keys(current.files).filter((path) => !nextPaths.has(path));

    stale.forEach((path) => current.deleteFile(path));
    current.updateFile(externalFiles);
    current.setActiveFile(ENTRY_FILE);
    visibleFiles(externalFiles).forEach((path) => current.openFile(path));

    current.runSandpack().catch((error) => {
      console.error("[builder] no se pudo recompilar el sandbox al cambiar de proyecto", {
        projectId,
        error,
      });
      toast.error("El preview quedo desactualizado. Recargalo con el boton de refresh.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    const current = sandpackRef.current;

    const changed = Object.entries(externalFiles).filter(
      ([path, content]) => current.files[path]?.code !== content,
    );
    const stale = Object.keys(current.files).filter(
      (path) => !HIDDEN_FILES.includes(path) && !(path in externalFiles),
    );

    // Primero sacamos los archivos del proyecto anterior. updateFile define el
    // estado final de recompilacion, por eso debe ser la ultima operacion.
    stale.forEach((path) => current.deleteFile(path, false));

    if (changed.length > 0) {
      const nuevos = changed
        .map(([path]) => path)
        .filter((path) => !(path in current.files) && !HIDDEN_FILES.includes(path));

      // Mientras la IA escribe no compilamos: App.tsx puede importar archivos que
      // todavía no llegaron. La recompilación única ocurre al cerrar el turno.
      current.updateFile(Object.fromEntries(changed), undefined, !isStreaming);
      // updateFile no toca visibleFiles: sin esto los archivos nuevos que crea
      // la IA no aparecen en el explorador (autoHiddenFiles los filtra).
      nuevos.forEach((path) => current.openFile(path));
    }

    // Recien aca el sandbox tiene todo: si quedo una recompilacion pendiente
    // del turno que termino, este es el momento. Al cambiar de proyecto con
    // archivos completos no hacemos runSandpack: updateFile ya re-bundlea en
    // caliente y evita reiniciar Nodebox.
    if (!isStreaming && changed.length > 0) {
      // El cambio de proyecto ya se recompila con updateFile; no hace falta
      // reiniciar el sandbox por la bandera de un turno anterior.
      rerunPendingRef.current = false;
      if (rerunTimerRef.current) {
        clearTimeout(rerunTimerRef.current);
        rerunTimerRef.current = null;
      }
    } else if (
      !isStreaming &&
      rerunPendingRef.current &&
      changed.length === 0 &&
      stale.length === 0
    ) {
      rerun();
    }
  }, [externalFiles, isStreaming, rerun]);

  useEffect(() => {
    if (typeof code !== "string") return;
    if (externalFiles[activeFile] === code) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(activeFile, code), SAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeFile, code, externalFiles, save]);

  return null;
}

/**
 * Recibe las capturas que manda el sandbox (ver el script inyectado en
 * `/index.html` de la plantilla) y las persiste para las tarjetas del
 * dashboard.
 *
 * El `origin` del mensaje es el del bundler, no el nuestro, asi que no se puede
 * validar por origen: se valida la forma del payload aca y el formato/tamaño
 * del dataURL de nuevo en el server action.
 */
function useThumbnailCapture(projectId: string) {
  const lastSentRef = useRef<string | null>(null);

  useEffect(() => {
    async function onMessage(event: MessageEvent) {
      const data = event.data;

      if (
        typeof data !== "object" ||
        data === null ||
        (data as { type?: unknown }).type !== "builto:thumbnail"
      ) {
        return;
      }

      const dataUrl = (data as { dataUrl?: unknown }).dataUrl;

      if (typeof dataUrl !== "string") return;
      // html2canvas devuelve "data:," cuando el canvas sale de 0px: pasa en la
      // primera captura, antes de que el sitio tenga layout. Es una captura
      // vacia, no un error — se descarta sin molestar al server ni al overlay
      // de errores de Next (que cuenta cada console.error como un issue).
      if (!dataUrl.startsWith("data:image/")) return;
      // El sandbox recaptura ante cada cambio del DOM: sin esto se escribe la
      // misma imagen en la DB una y otra vez.
      if (lastSentRef.current === dataUrl) return;

      lastSentRef.current = dataUrl;

      try {
        const result = await saveProjectThumbnail({ projectId, dataUrl });

        if (!result.ok) {
          console.error("[builder] la captura del preview fue rechazada", {
            projectId,
            error: result.error,
          });
        }
      } catch (error) {
        console.error("[builder] no se pudo guardar la captura del preview", {
          projectId,
          error,
        });
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [projectId]);
}
