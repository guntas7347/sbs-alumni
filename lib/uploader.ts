"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// const UPLOAD_DIR = "C:/Hosting/data/alumni";

const UPLOAD_PUBLIC_DIR = path.join(process.cwd(), "public", "uploads");
const UPLOAD_DATA_DIR = path.join(process.cwd(), "data");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return {
        success: false,
        path: null,
        url: null,
        error: "No file provided.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        path: null,
        url: null,
        error: "File size must not exceed 10 MB.",
      };
    }

    if (!ALLOWED_TYPES.has(file.type.toLowerCase())) {
      return {
        success: false,
        path: null,
        url: null,
        error: "File type is not allowed. Please upload a JPG, PNG, or WebP screenshot.",
      };
    }

    // Create the directories if they don't exist.
    await mkdir(UPLOAD_PUBLIC_DIR, { recursive: true });
    await mkdir(UPLOAD_DATA_DIR, { recursive: true });

    // Generate a unique filename to prevent collisions.
    const extension = path.extname(file.name).toLowerCase() || ".png";
    const filename = `${randomUUID()}${extension}`;
    const publicPath = path.join(UPLOAD_PUBLIC_DIR, filename);
    const dataPath = path.join(UPLOAD_DATA_DIR, filename);

    // Save the file to both public/uploads and data directory.
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(publicPath, buffer);
    try {
      await writeFile(dataPath, buffer);
    } catch {
      // ignore secondary save if data dir fails
    }

    return {
      success: true,
      path: publicPath,
      filename,
      url: `/uploads/${filename}`,
      error: null,
    };
  } catch (error) {
    console.error("File upload failed:", error);

    return {
      success: false,
      path: null,
      url: null,
      error: "Failed to upload file.",
    };
  }
}
