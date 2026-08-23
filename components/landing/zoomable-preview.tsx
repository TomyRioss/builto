"use client";

import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ZoomablePreviewProps = { src: string; alt: string };

export function ZoomablePreview({ src, alt }: ZoomablePreviewProps) {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Ampliar: ${alt}`}
        className="group relative block h-44 w-full cursor-zoom-in overflow-hidden rounded-sm border border-[#e1e3e4] bg-[#f8f9fa] sm:h-48"
      >
        <Image src={src} alt={alt} fill className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]" />
        <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-black opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <ZoomIn aria-hidden="true" className="size-4" />
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-white p-2 sm:max-w-4xl">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
          <Image src={src} alt={alt} fill className="object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
