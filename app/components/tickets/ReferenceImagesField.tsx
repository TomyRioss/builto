"use client";

import { useEffect, useRef, useState } from "react";
import { LuImagePlus, LuX, LuLoader } from "react-icons/lu";

import { compressToWebp } from "@/lib/images/compress";

export type Reference = { id: string; file: File; previewUrl: string };

type Props = {
  files: Reference[];
  onChange: (files: Reference[]) => void;
  max: number;
  maxBytes: number;
};

const ACCEPT = "image/png,image/jpeg,image/webp";

/** Imagenes de referencia del ticket. Se comprimen a webp antes de salir del navegador. */
export function ReferenceImagesField({ files, onChange, max, maxBytes }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Los object URLs se liberan cuando el componente se va: si no, quedan colgados.
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return;

    const room = max - files.length;
    if (room <= 0) {
      setError(`Ya adjuntaste ${max} imagenes.`);
      return;
    }

    setBusy(true);
    setError(null);

    const accepted: Reference[] = [];
    for (const file of Array.from(incoming).slice(0, room)) {
      try {
        const { file: webp } = await compressToWebp(file, maxBytes);
        accepted.push({
          id: `${file.name}-${Date.now()}-${accepted.length}`,
          file: webp,
          previewUrl: URL.createObjectURL(webp),
        });
      } catch (err) {
        console.error("[tickets] fallo la compresion de una referencia", {
          name: file.name,
          type: file.type,
          size: file.size,
          error: err,
        });
        setError(
          err instanceof Error ? err.message : `No pudimos procesar "${file.name}".`,
        );
      }
    }

    if (accepted.length > 0) onChange([...files, ...accepted]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(id: string) {
    const target = files.find((f) => f.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(files.filter((f) => f.id !== id));
    setError(null);
  }

  const full = files.length >= max;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium leading-5">
        Imagenes de referencia{" "}
        <span className="font-normal text-[#7e7576]">· opcional</span>
      </span>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void add(e.dataTransfer.files);
        }}
        className={`rounded-lg border border-dashed px-4 py-5 transition-colors duration-150 ${
          dragging ? "border-[#4648d4] bg-[#eef2ff]" : "border-[#cfc4c5] bg-[#f8f9fa]"
        }`}
      >
        <input
          ref={inputRef}
          id="ticket-references"
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => void add(e.target.files)}
        />

        {files.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-3">
            {files.map((file) => (
              <li key={file.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.previewUrl}
                  alt={file.file.name}
                  className="size-20 rounded-md border border-[#e1e3e4] object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(file.id)}
                  className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-[#e1e3e4] bg-[#ffffff] text-[#4c4546] transition-colors duration-150 hover:bg-[#edeeef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]"
                >
                  <LuX className="size-3.5" aria-hidden />
                  <span className="sr-only">Quitar {file.file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy || full}
            className="inline-flex items-center gap-2 rounded-md border border-[#191c1d] px-4 py-2 text-sm font-medium leading-5 text-[#191c1d] transition-colors duration-150 hover:bg-[#edeeef] disabled:cursor-not-allowed disabled:border-[#cfc4c5] disabled:text-[#7e7576] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]"
          >
            {busy ? (
              <LuLoader className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <LuImagePlus className="size-4" aria-hidden />
            )}
            {busy ? "Procesando..." : "Elegir imagenes"}
          </button>
          <p className="text-sm leading-5 text-[#4c4546]">
            {full
              ? `Llegaste al maximo de ${max}.`
              : `Arrastralas aca. PNG, JPG o WEBP, hasta ${max}.`}
          </p>
        </div>
      </div>

      {error && <p className="text-sm leading-5 text-[#ba1a1a]">{error}</p>}
    </div>
  );
}
