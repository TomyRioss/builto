"use client";

import type { ReactNode } from "react";
import { SandpackProvider } from "@codesandbox/sandpack-react";

import {
  HIDDEN_FILES,
  SANDBOX_ENVIRONMENT,
  SANDBOX_ENTRY,
  SANDBOX_TEMPLATE,
  STARTER_FILES,
} from "@/lib/builder/template";

const SANDBOX_SETUP = {
  environment: SANDBOX_ENVIRONMENT,
  entry: SANDBOX_ENTRY,
};

const SANDBOX_OPTIONS = {
  activeFile: "/src/App.tsx",
  visibleFiles: Object.keys(STARTER_FILES).filter((path) => !HIDDEN_FILES.includes(path)),
  bundlerTimeOut: 240_000,
};

/** Mantiene Nodebox caliente mientras el usuario navega entre proyectos. */
export function BuilderSandbox({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SandpackProvider
        template={SANDBOX_TEMPLATE}
        files={STARTER_FILES}
        customSetup={SANDBOX_SETUP}
        options={SANDBOX_OPTIONS}
        style={{ height: "100%" }}
      >
        {children}
      </SandpackProvider>
    </div>
  );
}
