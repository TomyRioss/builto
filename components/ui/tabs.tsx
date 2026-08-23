"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn("flex flex-col", className)} {...props} />;
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("flex w-full items-center gap-1 border-b border-[#e1e3e4]", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative flex min-h-11 flex-1 items-center justify-center gap-2 px-3 text-sm font-medium text-[#777879] transition-colors hover:text-black focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4] data-[state=active]:text-[#4648d4] sm:flex-none sm:justify-start sm:px-4",
        "after:absolute after:inset-x-2 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-transparent data-[state=active]:after:bg-[#4648d4]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("mt-5 outline-none", className)} {...props} />;
}
