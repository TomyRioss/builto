import { AERONAUTICA_SEED } from "./seeds/aeronautica";
import { RESTAURANTE_SEED } from "./seeds/restaurante";
import { VIAJES_SEED } from "./seeds/viajes";

/**
 * Registro de plantillas usables como base de un chat.
 *
 * `files` son los overrides sobre STARTER_FILES del sandbox: se guardan como
 * ProjectFile al crear el proyecto y `withStarterFiles()` los pisa encima del
 * andamiaje base. El resto del starter (vite config, tsconfig, main.tsx...)
 * sigue viniendo del starter comun.
 */
export const TEMPLATE_SEEDS: Record<
  string,
  { name: string; description: string; files: Record<string, string> }
> = {
  aeronautica: {
    name: "Aeronáutica",
    description: "Landing page para empresa del rubro aeronáutico.",
    files: AERONAUTICA_SEED,
  },
  restaurante: {
    name: "Origen — Restaurante de alta cocina",
    description:
      "Landing page para restaurante gourmet: reservas, menú interactivo, galería.",
    files: RESTAURANTE_SEED,
  },
  viajes: {
    name: "Aura — Viajes de autor & expediciones",
    description:
      "Landing page para agencia de viajes: catálogo de destinos, itinerarios.",
    files: VIAJES_SEED,
  },
};

export function getTemplateSeed(slug: string) {
  return TEMPLATE_SEEDS[slug] ?? null;
}
