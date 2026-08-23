"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { LuPlus } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { openTicket, type ActionState } from "@/app/dashboard/(main)/tickets/actions";

const initialState: ActionState = { ok: false, error: null };

type Props = {
  projects: { id: string; name: string }[];
};

export function NewTicketDialog({ projects }: Props) {
  const [open, setOpen] = useState(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="lg"
            className="rounded-md bg-[#000000] px-5 text-xs font-semibold uppercase tracking-[0.05em] text-[#ffffff] hover:bg-[#1b1b1b]"
          />
        }
      >
        <LuPlus className="size-4" aria-hidden />
        Abrir ticket
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold leading-6">
            Abrir ticket
          </DialogTitle>
          <DialogDescription className="text-sm leading-5 text-[#4c4546]">
            Contanos que necesitas. Un dev lo revisa y te manda la cotizacion.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-project">Proyecto</Label>
            <Select
              name="projectId"
              required
              defaultValue={projects.length === 1 ? projects[0].id : undefined}
            >
              <SelectTrigger id="ticket-project" size="default" className="w-full">
                <SelectValue placeholder="Elegi un proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-title">Titulo</Label>
            <Input
              id="ticket-title"
              name="title"
              required
              minLength={4}
              maxLength={120}
              placeholder="Sumar formulario de contacto"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-description">Descripcion</Label>
            <Textarea
              id="ticket-description"
              name="description"
              required
              minLength={10}
              maxLength={5000}
              rows={5}
              placeholder="Que hay que hacer, donde y con que detalle."
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" size="lg" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Abriendo..." : "Abrir ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
