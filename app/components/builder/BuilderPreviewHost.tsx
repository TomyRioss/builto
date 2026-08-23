"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

// Sandpack levanta un iframe y toca window al montar: no tiene nada que hacer
// en el render del server.
const PreviewPanel = dynamic(() => import("./PreviewPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-[#f8f9fa] px-6 text-center">
      <p className="text-sm font-medium text-[#4c4546]">Preparando el preview</p>
      {/* El arranque en frio instala las dependencias de verdad: ~1 minuto. */}
      <p className="max-w-[40ch] text-sm text-[#7e7576]">
        Instalando las dependencias del proyecto. La primera vez tarda cerca de
        un minuto.
      </p>
    </div>
  ),
});

type ProjectPreview = {
  projectId: string;
  files: Record<string, string>;
  writingPath: string | null;
  isStreaming: boolean;
};

type Ctx = {
  setPortalTarget: (el: HTMLDivElement | null) => void;
  setProject: (data: ProjectPreview) => void;
};

const BuilderPreviewContext = createContext<Ctx | null>(null);

/**
 * El sandbox de Sandpack (Nodebox) corre npm install de verdad al montar:
 * ~50s en frio (ver comentario en PreviewPanel/template). Si cada pagina de
 * conversationId monta su propio SandpackProvider, cambiar de proyecto repite
 * ese install cada vez. Este host vive en el layout de /dashboard/builder,
 * que Next NO desmonta al navegar entre conversaciones: un solo
 * SandpackProvider persiste entre proyectos y PreviewPanel diffea los
 * archivos en vez de remontar.
 *
 * El panel se porta via createPortal a un div que cada pagina renderiza en su
 * lugar (BuilderWorkspace), para que siga viviendo en el layout de flex
 * correcto sin que el layout tenga que conocer la estructura de la pagina.
 */
export function BuilderPreviewHost({ children }: { children: ReactNode }) {
  const [portalTarget, setPortalTargetState] = useState<HTMLDivElement | null>(null);
  const [project, setProject] = useState<ProjectPreview | null>(null);

  const setPortalTarget = useCallback((el: HTMLDivElement | null) => {
    setPortalTargetState(el);
  }, []);

  return (
    <BuilderPreviewContext.Provider value={{ setPortalTarget, setProject }}>
      {children}
      {portalTarget && project
        ? createPortal(
            <PreviewPanel
              projectId={project.projectId}
              files={project.files}
              writingPath={project.writingPath}
              isStreaming={project.isStreaming}
            />,
            portalTarget,
          )
        : null}
    </BuilderPreviewContext.Provider>
  );
}

/** Registra el proyecto activo de la pagina y devuelve el setter del nodo donde se porta el preview. */
export function useBuilderPreview(data: ProjectPreview) {
  const ctx = useContext(BuilderPreviewContext);
  if (!ctx) throw new Error("useBuilderPreview requiere BuilderPreviewHost");

  const { setProject } = ctx;
  useEffect(() => {
    setProject(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setProject, data.projectId, data.files, data.writingPath, data.isStreaming]);

  return ctx.setPortalTarget;
}
