import type { Screenshot } from "./checkout";

/** Longest side after downscaling; phone screenshots stay legible at this size. */
const MAX_SIDE = 2000;
const QUALITY = 0.85;
/** Largest file we accept from the picker. */
const MAX_INPUT = 10 * 1024 * 1024;
/** Largest upload. Keep in sync with MAX_SCREENSHOT in src/app/api/orders/route.ts (base64 is 4/3 larger). */
const MAX_UPLOAD = 3 * 1024 * 1024;

/**
 * Turns a chosen payment screenshot into an upload: re-encoded as a JPEG no larger than MAX_SIDE so
 * it stays well inside the request limit. Images the browser can't decode go as they are if small enough.
 */
export async function prepareScreenshot(file: File): Promise<Screenshot> {
  if (!file.type.startsWith("image/") || file.size > MAX_INPUT) throw new Error("Unsupported file");
  const blob = (await toJpeg(file).catch(() => null)) ?? file;
  if (blob.size > MAX_UPLOAD) throw new Error("File too large");
  const name = blob === file ? file.name : `${file.name.replace(/\.[^.]+$/, "")}.jpg`;
  return { name, type: blob.type, data: await toBase64(blob) };
}

/** Data URL for previewing a prepared screenshot. */
export function screenshotUrl(screenshot: Screenshot) {
  return `data:${screenshot.type};base64,${screenshot.data}`;
}

async function toJpeg(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No 2D context");
  // JPEG has no alpha: paint transparent areas white rather than black.
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed"))), "image/jpeg", QUALITY),
  );
}

function toBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
