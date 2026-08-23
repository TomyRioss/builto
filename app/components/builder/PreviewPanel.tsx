"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuCode, LuDownload, LuEye, LuLoader, LuUpload } from "react-icons/lu";
import { toast } from "sonner";

import { importProjectFiles, saveProjectFile, saveProjectThumbnail } from "@/app/dashboard/builder/actions";
import { NewTicketDialog } from "@/app/components/tickets/NewTicketDialog";
import { normalizePath } from "@/lib/builder/protocol";
import { ENTRY_FILE, HIDDEN_FILES } from "@/lib/builder/template";

const SAVE_DEBOUNCE_MS = 800;

/** Mensajes que rotan mientras el server compila con Vite. */
const LOADING_MESSAGES = [
  "Cargando obra maestra",
  "Codificando asombro",
  "Renderizando frontend",
  "Compilando genialidad",
  "Resolviendo promesas",
  "Convenciendo al bundler",
  "Corriendo vite build, paciencia",
  "Buscando el punto y coma",
  "Calentando la CPU",
  "Haciendo magia con Vite",
  "Alineando los divs",
  "Silenciando warnings de TypeScript",
  "Centrando un div (dificil, ya sabemos)",
  "Desenredando el spaghetti de CSS",
  "Persiguiendo un pixel rebelde",
  "Traduciendo diseño a componentes",
  "Contando divs innecesarios",
  "Acomodando el caos con flexbox",
  "Poniendo los píxeles en fila",
  "Casi listo, no muevas nada",
];

const EASTER_EGG_MESSAGE = "Farmeando aura";
const EASTER_EGG_CHANCE = 0.02;
const MESSAGE_INTERVAL_MS = 2200;
const DOT_INTERVAL_MS = 450;

const CUBE_HALF = "36px";
const CUBE_FACES = [
  { transform: `rotateY(0deg) translateZ(${CUBE_HALF})` },
  { transform: `rotateY(180deg) translateZ(${CUBE_HALF})` },
  { transform: `rotateY(90deg) translateZ(${CUBE_HALF})` },
  { transform: `rotateY(-90deg) translateZ(${CUBE_HALF})` },
  { transform: `rotateX(90deg) translateZ(${CUBE_HALF})` },
  { transform: `rotateX(-90deg) translateZ(${CUBE_HALF})` },
];

/** Recompilar tras el ultimo turno queda cubierto por un margen chico. */
const RERUN_SETTLE_MS = 300;
/** Si el build server-side no vuelve en este tiempo, se asume colgado. */
const STUCK_BUILD_MS = 90_000;

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
 * El preview ya no corre en el browser (Sandpack/Nodebox): el server compila
 * el proyecto con Vite de verdad (`lib/builder/sandbox-build.ts`, Node real,
 * misma maquina que ya probamos que resuelve npm/CDN sin problema) y devuelve
 * un HTML listo. El iframe solo lo carga por `src` — nada de bundler, CSP ni
 * cookies de terceros del lado del cliente puede romperlo.
 */
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

  const { previewUrl, building, stuck, retry, onLoaded } = useServerPreview(projectId, isStreaming);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8f9fa]">
      <header className="flex items-center gap-2 border-b border-[#cfc4c5] bg-[#ffffff] px-4 py-3">
        <TabButton active={tab === "preview"} onClick={() => setTab("preview")} Icon={LuEye}>
          Preview
        </TabButton>
        <TabButton active={tab === "code"} onClick={() => setTab("code")} Icon={LuCode}>
          Codigo
        </TabButton>

        <NewTicketDialog projects={[{ id: projectId, name: projectName, thumbnail: null }]} />

        {writingPath && (
          <span className="ml-auto flex items-center gap-2 text-xs font-medium text-[#4648d4]">
            <LuLoader className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
            Escribiendo {writingPath}
          </span>
        )}
      </header>

      <style jsx global>{`
        @keyframes preview-cube-spin {
          from { transform: rotateX(-25deg) rotateY(0deg); }
          to { transform: rotateX(-25deg) rotateY(360deg); }
        }
        @keyframes preview-progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.6); }
          100% { transform: scaleX(0.95); }
        }
      `}</style>

      <div className="relative min-h-0 flex-1">
        {isStreaming && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[80] h-0.5 origin-left bg-[#6063ee] shadow-[0_0_10px_rgba(96,99,238,0.7)] motion-safe:animate-[preview-progress_1.4s_ease-in-out_infinite]"
            role="progressbar"
            aria-label="Generando preview"
          />
        )}

        {building && !stuck && <BundlerLoadingText />}
        {stuck && <StuckOverlay onRetry={retry} />}

        <iframe
          key={previewUrl}
          title="Preview"
          src={previewUrl}
          onLoad={onLoaded}
          sandbox="allow-scripts allow-same-origin"
          className="h-full w-full border-0 bg-white"
          style={{ display: tab === "preview" ? "block" : "none" }}
        />

        <div style={{ display: tab === "code" ? "flex" : "none", height: "100%" }}>
          <CodeEditor
            projectId={projectId}
            files={files}
            allowImport={allowImport}
            readOnly={readOnly}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Pide el HTML compilado al server. Se dispara al montar y cada vez que un
 * turno termina (isStreaming pasa a false) — nunca en cada tecla del stream,
 * seria un build de Vite por caracter.
 */
function useServerPreview(projectId: string, isStreaming: boolean) {
  const [buildKey, setBuildKey] = useState(() => Date.now());
  const [building, setBuilding] = useState(true);
  const [stuck, setStuck] = useState(false);
  const wasStreamingRef = useRef(isStreaming);

  useEffect(() => {
    const wasStreaming = wasStreamingRef.current;
    wasStreamingRef.current = isStreaming;
    if (isStreaming || !wasStreaming) return;

    const timer = setTimeout(() => {
      setBuilding(true);
      setBuildKey(Date.now());
    }, RERUN_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [isStreaming]);

  useEffect(() => {
    if (!building) return;
    setStuck(false);
    const timer = setTimeout(() => setStuck(true), STUCK_BUILD_MS);
    return () => clearTimeout(timer);
  }, [building, buildKey]);

  const previewUrl = useMemo(
    () => `/api/builder/projects/${projectId}/preview?v=${buildKey}`,
    [projectId, buildKey],
  );

  const retry = useCallback(() => {
    setBuilding(true);
    setBuildKey(Date.now());
  }, []);

  return { previewUrl, building, stuck, retry, onLoaded: () => setBuilding(false) };
}

function StuckOverlay({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-[75] flex items-center justify-center bg-[#f8f9fa]/95 p-6">
      <div className="w-full max-w-md rounded-xl border border-[#cfc4c5] bg-white p-6 text-center shadow-[0_18px_45px_-28px_rgba(0,0,0,0.25)]">
        <h2 className="text-lg font-semibold text-[#191c1d]">El preview esta tardando de mas</h2>
        <p className="mt-2 text-sm text-[#6b6162]">
          El build server-side no volvio a tiempo. Puede ser la primera compilacion en frio.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-md bg-[#4648d4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3537b8]"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

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
          style={{ transformStyle: "preserve-3d", animation: "preview-cube-spin 2.4s linear infinite" }}
        >
          {CUBE_FACES.map(({ transform }, i) => (
            <div key={i} className="absolute inset-0 border border-[#4648d4] bg-[#eef2ff]" style={{ transform }} />
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
        active ? "bg-[#eef2ff] text-[#4648d4]" : "text-[#4c4546] hover:bg-[#edeeef] hover:text-[#191c1d]"
      }`}
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </button>
  );
}

const BINARY_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "ico", "pdf", "zip", "woff", "woff2", "ttf", "eot", "mp3", "mp4", "webm",
]);

/**
 * Sin SandpackProvider ya no hay editor propio del proveedor: explorador +
 * textarea, minimo necesario para editar/importar/exportar el mismo set de
 * archivos multi-archivo de siempre.
 */
function CodeEditor({
  projectId,
  files,
  allowImport,
  readOnly,
}: {
  projectId: string;
  files: Record<string, string>;
  allowImport: boolean;
  readOnly: boolean;
}) {
  const visible = useMemo(
    () => Object.keys(files).filter((path) => !HIDDEN_FILES.includes(path)).sort(),
    [files],
  );
  const [selected, setSelected] = useState<string>(ENTRY_FILE);
  const [value, setValue] = useState(files[selected] ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setValue(files[selected] ?? "");
  }, [files, selected]);

  const save = useCallback(
    (path: string, content: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        const result = await saveProjectFile({ projectId, path, content });
        if (!result.ok) {
          console.error("[builder] el guardado manual fue rechazado", { projectId, path, error: result.error });
          toast.error(result.error ?? "No pudimos guardar el archivo.");
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [projectId],
  );

  async function handleImportFile(file: File) {
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

      const imported = await Promise.all(entries.map(async (entry) => ({
        path: normalizePath(entry.name.replaceAll("\\", "/").slice(commonRoot.length)),
        content: await entry.async("string"),
      })));
      const result = await importProjectFiles({ projectId, files: imported });
      if (!result.ok) {
        toast.error(result.error ?? "No pudimos guardar los archivos importados.");
        return;
      }
      toast.success(`${imported.length} archivos importados correctamente.`);
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
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const path of visible) {
        zip.file(path.replace(/^\//, ""), files[path] ?? "");
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
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex w-52 shrink-0 flex-col border-r border-[#cfc4c5] bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {visible.map((path) => (
            <button
              key={path}
              type="button"
              onClick={() => setSelected(path)}
              className={`block w-full truncate rounded px-2 py-1.5 text-left text-xs ${
                selected === path ? "bg-[#eef2ff] font-medium text-[#4648d4]" : "text-[#4c4546] hover:bg-[#edeeef]"
              }`}
            >
              {path}
            </button>
          ))}
        </div>
        {!readOnly && (
          <div className="grid grid-cols-1 border-t border-[#cfc4c5]">
            {allowImport && (
              <>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleImportFile(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  disabled={importing}
                  className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-[#191c1d] hover:bg-[#edeeef] disabled:opacity-60"
                >
                  {importing ? <LuLoader className="size-3.5 animate-spin" aria-hidden /> : <LuUpload className="size-3.5" aria-hidden />}
                  {importing ? "Importando..." : "Importar ZIP"}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 border-t border-[#cfc4c5] px-3 py-2.5 text-xs font-medium text-[#191c1d] hover:bg-[#edeeef] disabled:opacity-60"
            >
              {exporting ? <LuLoader className="size-3.5 animate-spin" aria-hidden /> : <LuDownload className="size-3.5" aria-hidden />}
              Exportar ZIP
            </button>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-[#cfc4c5] bg-white px-3 py-2 text-xs font-medium text-[#4c4546]">
          {selected}
        </div>
        <textarea
          value={value}
          readOnly={readOnly}
          spellCheck={false}
          onChange={(event) => {
            const next = event.target.value;
            setValue(next);
            if (!readOnly) save(selected, next);
          }}
          className="min-h-0 flex-1 resize-none border-0 bg-[#0d1117] p-4 font-mono text-xs leading-relaxed text-[#c9d1d9] outline-none"
        />
      </div>
    </div>
  );
}

/**
 * Recibe las capturas que manda el sandbox (ver el script inyectado en
 * `/index.html` de la plantilla) y las persiste para las tarjetas del
 * dashboard.
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
      if (!dataUrl.startsWith("data:image/")) return;
      if (lastSentRef.current === dataUrl) return;

      lastSentRef.current = dataUrl;

      try {
        const result = await saveProjectThumbnail({ projectId, dataUrl });

        if (!result.ok) {
          console.error("[builder] la captura del preview fue rechazada", { projectId, error: result.error });
        }
      } catch (error) {
        console.error("[builder] no se pudo guardar la captura del preview", { projectId, error });
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [projectId]);
}
