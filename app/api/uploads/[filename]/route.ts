import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return new NextResponse("Invalid filename", { status: 400 });
    }

    const publicPath = path.join(process.cwd(), "public", "uploads", filename);
    const dataPath = path.join(process.cwd(), "data", filename);

    let buffer: Buffer | null = null;
    try {
      buffer = await readFile(publicPath);
    } catch {
      try {
        buffer = await readFile(dataPath);
      } catch {
        return new NextResponse("File not found", { status: 404 });
      }
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("Error serving uploaded file:", err);
    return new NextResponse("Error reading file", { status: 500 });
  }
}
