/**
 * `redirect()` de Next viaja como excepcion. Sin esto, todo `catch` alrededor de
 * una server action que redirige muestra un error que no existe.
 */
export function isRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}
