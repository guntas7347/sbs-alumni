// This function takes in image and returns its text data, client-side.
// Basically its an OCR

import { createWorker } from "tesseract.js";

export async function extractText(image: File | Blob): Promise<string[]> {
  const worker = await createWorker("eng");

  try {
    const {
      data: { text },
    } = await worker.recognize(image);

    return text
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
  } finally {
    await worker.terminate();
  }
}
