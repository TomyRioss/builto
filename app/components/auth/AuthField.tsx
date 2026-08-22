"use client";

import { useState } from "react";
import { LuEye, LuEyeOff, LuTriangleAlert } from "react-icons/lu";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFieldProps = React.ComponentProps<typeof Input> & {
  label: string;
  id: string;
  hint?: string;
};

export function AuthField({ label, id, hint, ...props }: AuthFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = props.type === "password";

  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#4c4546]"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`h-11 rounded border-[#cfc4c5] bg-[#ffffff] px-3 text-base text-[#191c1d] placeholder:text-[#7e7576] focus-visible:border-[#4648d4] focus-visible:ring-[#4648d4]/25 md:text-sm ${
            isPassword ? "pr-11" : ""
          }`}
          {...props}
          type={isPassword && revealed ? "text" : props.type}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-controls={id}
            aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r text-[#4c4546] hover:text-[#191c1d] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4648d4]"
          >
            {revealed ? (
              <LuEyeOff className="size-4" aria-hidden />
            ) : (
              <LuEye className="size-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs leading-4 text-[#4c4546]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded border border-[#93000a] bg-[#ffdad6] px-3 py-2.5 text-sm leading-5 text-[#93000a]"
    >
      <LuTriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
