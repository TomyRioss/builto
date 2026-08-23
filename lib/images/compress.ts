/**
 * Compresion de imagenes en el navegador: canvas -> webp. Nativo, sin libs.
 * ponytail: ffmpeg haria lo mismo pero no existe en runtime serverless, y subir
 * el original para recomprimirlo en el server desperdicia el ancho de banda que
 * justamente queremos ahorrar.
 */
const MAX_EDGE = 1600;
const QUALITIES = [0.82, 0.7, 0.55];

export type CompressResult = { file: File; width: number; height: number };

function loadBitmap(file: File): Promise<ImageBitmap> {
  // createImageBitmap respeta la orientacion EXIF; <img> no siempre.
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

/**
 * Devuelve un webp de como maximo `maxBytes`. Si ni con la calidad mas baja
 * entra, tira error: mejor decirlo que subir algo que el server va a rechazar.
 */
export async function compressToWebp(file: File, maxBytes: number): Promise<CompressResult> {
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("El navegador no pudo procesar la imagen.");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  for (const quality of QUALITIES) {
    const blob = await toBlob(canvas, quality);

    if (!blob) throw new Error("El navegador no pudo convertir la imagen a webp.");
    if (blob.size <= maxBytes) {
      const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
      return { file: new File([blob], name, { type: "image/webp" }), width, height };
    }
  }

  throw new Error(`"${file.name}" sigue pesando demasiado despues de comprimir.`);
}
