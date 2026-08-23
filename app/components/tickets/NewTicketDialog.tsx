"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LuTicket,
  LuCode,
  LuHistory,
  LuPalette,
  LuFolderOpen,
  LuClock,
  LuCreditCard,
  LuSparkles,
  LuArrowRight,
  LuArrowLeft,
  LuCheck,
  LuImage,
} from "react-icons/lu";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { openTicket, type ActionState } from "@/app/dashboard/(main)/tickets/actions";
import {
  ReferenceImagesField,
  type Reference,
} from "@/app/components/tickets/ReferenceImagesField";

const initialState: ActionState = { ok: false, error: null };

/** Lo que se le entrega al dev al tomar el ticket. Fijo: no lo elige el cliente. */
const HANDOVER = [
  { label: "Codigo del proyecto", Icon: LuCode },
  { label: "Historial con la IA", Icon: LuHistory },
  { label: "Tokens de diseno", Icon: LuPalette },
  { label: "Imagenes y archivos", Icon: LuFolderOpen },
];

const STEPS = ["Proyecto", "Alcance", "Confirmar"];

const SCOPE_MAX = 5000;

/** Mismos limites que valida el server en lib/storage/ticket-attachments.ts. */
const MAX_REFERENCES = 4;
const MAX_REFERENCE_BYTES = 1_500_000;

type Props = {
  projects: { id: string; name: string; thumbnail: string | null }[];
};

export function NewTicketDialog({ projects }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [projectId, setProjectId] = useState(
    projects.length === 1 ? projects[0].id : "",
  );
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [references, setReferences] = useState<Reference[]>([]);
  const [error, setError] = useState<{ field: string; message: string } | null>(null);
  const [state, formAction, pending] = useActionState(openTicket, initialState);

  useEffect(() => {
    if (state.ok) {
      const timeoutId = window.setTimeout(() => {
        setOpen(false);
        toast.success("Ticket abierto.");
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  // Al cerrar, el wizard vuelve a foja cero: no dejamos medio ticket cargado.
  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setStep(0);
      setTitle("");
      setScope("");
      setReferences([]);
      setError(null);
      setProjectId(projects.length === 1 ? projects[0].id : "");
    }
  }

  function goNext() {
    if (step === 0 && !projectId) {
      setError({ field: "project", message: "Elegi el proyecto sobre el que hay que trabajar." });
      return;
    }
    if (step === 1) {
      if (title.trim().length < 4) {
        setError({ field: "title", message: "El titulo necesita al menos 4 caracteres." });
        return;
      }
      if (scope.trim().length < 10) {
        setError({ field: "scope", message: "Escribi al menos 10 caracteres para que el dev entienda el pedido." });
        return;
      }
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    if (step === 0) onOpenChange(false);
    else setStep(step - 1);
  }

  function confirm() {
    const data = new FormData();
    data.set("projectId", projectId);
    data.set("title", title.trim());
    data.set("description", scope.trim());
    references.forEach((ref) => data.append("attachments", ref.file));
    startTransition(() => formAction(data));
  }

  const selectedProject = projects.find((p) => p.id === projectId);
  const projectName = selectedProject?.name ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button
            className="rounded-md bg-[#4648d4] px-3.5 text-xs font-semibold uppercase tracking-[0.05em] text-[#ffffff] shadow-[0_1px_2px_rgba(70,72,212,0.25)] hover:bg-[#3a3cb8]"
          />
        }
      >
        <LuTicket className="size-3.5" aria-hidden />
        Abrir ticket
      </DialogTrigger>

      <DialogContent
        className={`max-h-[88vh] gap-0 overflow-hidden p-0 ${
          step === 2 ? "sm:max-w-[680px]" : "sm:max-w-[560px]"
        }`}
      >
        {/* Progreso: tres segmentos, el mismo indigo que marca lo activo en todo el producto. */}
        <div className="flex gap-1 px-6 pt-6" aria-hidden>
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`h-0.5 flex-1 rounded-full transition-colors duration-200 ${
                i <= step ? "bg-[#4648d4]" : "bg-[#e1e3e4]"
              }`}
            />
          ))}
        </div>

        <DialogHeader className="px-6 pt-4">
          {step === 2 ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#4648d4]">
              <LuSparkles className="size-3" aria-hidden />
              Pasa a un dev
            </span>
          ) : (
            <p className="text-sm leading-5 text-[#4c4546]">
              Paso {step + 1} de {STEPS.length} · {STEPS[step]}
            </p>
          )}

          <DialogTitle className="text-xl font-semibold leading-7 tracking-[-0.01em]">
            {step === 2 ? "Confirma el pedido" : "Abrir ticket"}
          </DialogTitle>
          <DialogDescription className="max-w-[62ch] text-sm leading-5 text-[#4c4546]">
            {step === 0
              ? "Un dev de Builto va a trabajar sobre uno de tus proyectos. Elegi cual."
              : step === 1
                ? "Contale que necesitas. Cuanto mas concreto, mas precisa la cotizacion."
                : "Revisa el pedido antes de mandarlo."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[52vh] overflow-y-auto px-6 py-6">
          {step === 0 ? (
            <fieldset>
              <legend className="sr-only">Proyecto</legend>
              <div
                className="divide-y divide-[#f3f4f5] overflow-hidden rounded-lg border border-[#e1e3e4]"
                role="radiogroup"
                aria-label="Proyecto"
              >
                {projects.map((project) => {
                  const selected = project.id === projectId;

                  return (
                    <label
                      key={project.id}
                      className={`flex cursor-pointer items-start gap-3 px-4 py-4 transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[-2px] has-[:focus-visible]:outline-[#4648d4] ${
                        selected ? "bg-[#eef2ff]" : "hover:bg-[#f8f9fa]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="project"
                        value={project.id}
                        checked={selected}
                        onChange={() => {
                          setProjectId(project.id);
                          setError(null);
                        }}
                        className="sr-only"
                      />
                      <span
                        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${
                          selected
                            ? "border-[#4648d4] bg-[#4648d4] text-[#ffffff]"
                            : "border-[#7e7576]"
                        }`}
                        aria-hidden
                      >
                        {selected ? <LuCheck className="size-2.5" /> : null}
                      </span>
                      <span
                        className={`line-clamp-2 text-sm leading-5 ${
                          selected ? "font-medium text-[#191c1d]" : "text-[#4c4546]"
                        }`}
                      >
                        {project.name}
                      </span>
                    </label>
                  );
                })}
              </div>
              {error?.field === "project" && (
                <p className="mt-2 text-sm leading-5 text-[#ba1a1a]">{error.message}</p>
              )}
            </fieldset>
          ) : null}

          {step === 1 ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ticket-title">Titulo</Label>
                <Input
                  id="ticket-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError(null);
                  }}
                  maxLength={120}
                  aria-invalid={error?.field === "title"}
                  placeholder="Sumar formulario de contacto"
                />
                {error?.field === "title" && (
                  <p className="text-sm leading-5 text-[#ba1a1a]">{error.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="ticket-scope">Que hay que hacer</Label>
                <Textarea
                  id="ticket-scope"
                  value={scope}
                  onChange={(e) => {
                    setScope(e.target.value);
                    setError(null);
                  }}
                  maxLength={SCOPE_MAX}
                  rows={7}
                  aria-invalid={error?.field === "scope"}
                  placeholder="En que pantalla, con que integraciones y que tiene que quedar funcionando."
                />
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm leading-5 text-[#ba1a1a]">
                    {error?.field === "scope" ? error.message : ""}
                  </p>
                  <p className="shrink-0 text-sm leading-5 tabular-nums text-[#7e7576]">
                    {scope.length} / {SCOPE_MAX}
                  </p>
                </div>
              </div>

              <ReferenceImagesField
                files={references}
                onChange={setReferences}
                max={MAX_REFERENCES}
                maxBytes={MAX_REFERENCE_BYTES}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
                    Pedido
                  </h3>
                  <p className="mt-2 text-base font-medium leading-6">{title}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4c4546]">
                    {scope}
                  </p>
                  <p className="mt-3 text-sm leading-5 text-[#7e7576]">
                    Proyecto: {projectName}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="aspect-video overflow-hidden rounded-lg border border-[#e1e3e4] bg-[#f8f9fa]">
                    {selectedProject?.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedProject.thumbnail}
                        alt={`Preview de ${projectName}`}
                        className="size-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-2 text-[#7e7576]">
                        <LuImage className="size-6" aria-hidden />
                        <span className="text-xs leading-4">Sin preview</span>
                      </div>
                    )}
                  </div>

                  <dl className="flex flex-col divide-y divide-[#f3f4f5] rounded-lg border border-[#e1e3e4]">
                    <div className="flex items-center justify-between gap-4 px-4 py-4">
                      <dt className="inline-flex items-center gap-2 text-sm leading-5 text-[#4c4546]">
                        <LuClock className="size-4" aria-hidden />
                        Tiempo estimado
                      </dt>
                      <dd className="text-sm font-medium leading-5 text-[#4648d4]">
                        Lo define el dev
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-4">
                      <dt className="inline-flex items-center gap-2 text-sm leading-5 text-[#4c4546]">
                        <LuCreditCard className="size-4" aria-hidden />
                        Precio estimado
                      </dt>
                      <dd className="text-sm font-medium leading-5 text-[#4648d4]">
                        Lo define el dev
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
                  Lo que recibe el dev
                </h3>
                <ul className="mt-3 grid grid-cols-2 gap-3">
                  {HANDOVER.map(({ label, Icon }) => (
                    <li
                      key={label}
                      className="flex items-center gap-2.5 rounded-md bg-[#f3f4f5] px-4 py-4 text-sm font-medium leading-5"
                    >
                      <Icon className="size-4 shrink-0 text-[#7e7576]" aria-hidden />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="mx-0 mb-0 border-t border-[#e1e3e4] bg-[#f8f9fa] px-6 py-4">
          <Button type="button" variant="outline" size="lg" onClick={back} disabled={pending}>
            {step === 0 ? (
              "Cancelar"
            ) : (
              <>
                <LuArrowLeft className="size-4" aria-hidden />
                Atras
              </>
            )}
          </Button>

          {step < 2 ? (
            <Button type="button" size="lg" onClick={goNext}>
              Siguiente
              <LuArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={confirm}
              disabled={pending}
              className="bg-[#4648d4] text-[#ffffff] hover:bg-[#3a3cb8]"
            >
              {pending ? "Abriendo el ticket..." : "Abrir ticket"}
              <LuArrowRight className="size-4" aria-hidden />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
