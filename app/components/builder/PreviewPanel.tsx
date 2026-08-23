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
import { LuCode, LuDownload, LuEye, LuLoader } from "react-icons/lu";
import { toast } from "sonner";

import { saveProjectFile, saveProjectThumbnail } from "@/app/dashboard/builder/actions";
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
];

const MESSAGE_INTERVAL_MS = 2200;
const DOT_INTERVAL_MS = 450;

type Props = {
  projectId: string;
  files: Record<string, string>;
  writingPath: string | null;
  isStreaming: boolean;
};

/**
 * Margen para que `router.refresh()` traiga los archivos definitivos despues de
 * que termina el stream. Si no llegan en ese plazo, se recompila igual.
 */
const RERUN_FALLBACK_MS = 2000;

export default function PreviewPanel({
  projectId,
  files,
  writingPath,
  isStreaming,
}: Props) {
  const [tab, setTab] = useState<"preview" | "code">("preview");

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

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8f9fa]">
      <header className="flex items-center gap-2 border-b border-[#cfc4c5] bg-[#ffffff] px-4 py-3">
        <TabButton active={tab === "preview"} onClick={() => setTab("preview")} Icon={LuEye}>
          Preview
        </TabButton>
        <TabButton active={tab === "code"} onClick={() => setTab("code")} Icon={LuCode}>
          Codigo
        </TabButton>

        {writingPath && (
          <span className="ml-auto flex items-center gap-2 text-xs font-medium text-[#4648d4]">
            <LuLoader className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
            Escribiendo {writingPath}
          </span>
        )}
      </header>

      {/*
        Tailwind no llega acá: el cubo y el overlay de carga son markup
        interno de Sandpack (clases sp-*), no algo que nosotros escribimos.
        Se agranda, centra y le tapamos el resto del contenido con un
        override scopeado a este panel, no a global.css.
      */}
      <style jsx global>{`
        .sandpack-preview-scope .sp-loading {
          background: rgba(248, 249, 250, 0.82) !important;
          backdrop-filter: blur(10px);
        }
        .sandpack-preview-scope .sp-loading > *:not(.sp-cube-wrapper) {
          display: none !important;
        }
        .sandpack-preview-scope .sp-cube-wrapper {
          right: auto !important;
          bottom: auto !important;
          top: var(--cube-center-top) !important;
          left: 50% !important;
          width: auto !important;
          height: auto !important;
          transform: translate(-50%, -50%) !important;
        }
        .sandpack-preview-scope .sp-cube {
          transform: scale(0.95, 0.95) !important;
        }
      `}</style>

      <div
        ref={previewScopeRef}
        className="sandpack-preview-scope relative min-h-0 flex-1"
        style={{ "--cube-center-top": "42%" } as React.CSSProperties}
      >
        {bundlerLoading && <BundlerLoadingText />}

        <SandpackProvider
          template={SANDBOX_TEMPLATE}
          files={mountFiles}
          customSetup={mountSetup}
          options={mountOptions}
          style={{ height: "100%" }}
        >
          <FileSync
            projectId={projectId}
            externalFiles={files}
            isStreaming={isStreaming}
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
              <SandpackFileExplorer autoHiddenFiles style={{ flex: 1, minHeight: 0 }} />
              <ExportCodeButton />
            </div>
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              closableTabs
              style={{ height: "100%", display: tab === "code" ? "flex" : "none" }}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </section>
  );
}

/** Zippea los archivos visibles del sandbox y dispara la descarga. */
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
      className="flex items-center gap-2 border-t border-[#cfc4c5] bg-[#ffffff] px-4 py-3 text-sm font-medium text-[#191c1d] hover:bg-[#edeeef] disabled:opacity-60"
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
 * el DOM en vez de pelear con su estado interno.
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
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
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
      className="pointer-events-none absolute z-[70]"
      style={{
        top: "calc(var(--cube-center-top) + 130px)",
        left: "50%",
        transform: "translateX(calc(-50% + 56px))",
      }}
    >
      <p className="whitespace-nowrap text-center text-xl font-semibold tracking-[-0.01em] text-[#191c1d]">
        {LOADING_MESSAGES[messageIndex]}
        <span className="inline-block w-6 text-left">{".".repeat(dotCount)}</span>
      </p>
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
}: {
  projectId: string;
  externalFiles: Record<string, string>;
  isStreaming: boolean;
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
  sandpackRef.current = sandpack;

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

    sandpackRef.current.runSandpack().catch((error) => {
      console.error("[builder] no se pudo recompilar el sandbox", { projectId, error });
      toast.error("El preview quedo desactualizado. Recargalo con el boton de refresh.");
    });
  }, [projectId]);

  useEffect(() => {
    if (isStreaming) {
      rerunPendingRef.current = true;
      return;
    }
    if (!rerunPendingRef.current) return;

    // Lo normal es que router.refresh() traiga los archivos y dispare el efecto
    // de abajo antes de este plazo; el timer es la red por si no cambia nada.
    rerunTimerRef.current = setTimeout(rerun, RERUN_FALLBACK_MS);

    return () => {
      if (rerunTimerRef.current) clearTimeout(rerunTimerRef.current);
    };
  }, [isStreaming, rerun]);

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

    if (changed.length > 0) {
      const nuevos = changed
        .map(([path]) => path)
        .filter((path) => !(path in current.files) && !HIDDEN_FILES.includes(path));

      current.updateFile(Object.fromEntries(changed));
      // updateFile no toca visibleFiles: sin esto los archivos nuevos que crea
      // la IA no aparecen en el explorador (autoHiddenFiles los filtra).
      nuevos.forEach((path) => current.openFile(path));
    }

    // Recien aca el sandbox tiene todo: si quedo una recompilacion pendiente
    // del turno que termino, este es el momento.
    if (!isStreaming) rerun();
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
