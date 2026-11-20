import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

/**
 * Validates the file buffer using magic byte signatures
 */
function isValidImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  // WebP: 'RIFF' .... 'WEBP'
  const isWebp =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  return isJpeg || isPng || isWebp;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const userId = session.user.id || session.user.email || "user";

    // Rate limit: max 10 avatar uploads per 10 minutes per IP/user
    const rateCheck = checkRateLimit(`upload_avatar:${userId}:${clientIp}`, {
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return rateLimitResponse(rateCheck.reset);
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No image file provided" }, { status: 400 });
    }

    // 1. Validate file size (max 3 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File size exceeds the 3 MB limit. Please select a smaller image." },
        { status: 400 }
      );
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { message: "Invalid file format. Only PNG, JPG, JPEG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    // 3. Validate file extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { message: "Invalid file extension. Only .png, .jpg, .jpeg, and .webp files are accepted." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // 4. Magic-byte verification
    if (!isValidImageSignature(rawBuffer)) {
      return NextResponse.json(
        { message: "Invalid file signature. The file content does not match allowed image formats." },
        { status: 400 }
      );
    }

    // 5. Ensure upload directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // 6. Sanitize and re-encode image via sharp (strips EXIF, scripts, converts to standardized WebP)
    const sanitizedBuffer = await sharp(rawBuffer)
      .resize(400, 400, { fit: "cover", withoutEnlargement: false })
      .webp({ quality: 85 })
      .toBuffer();

    // 7. Generate secure unique filename
    const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `avatar-${safeUserId}-${Date.now()}.webp`;
    const filePath = path.join(uploadsDir, filename);

    // 8. Delete previously uploaded avatar for this user if it exists in local uploads
    const userWhere = session.user.id
      ? { id: session.user.id }
      : { email: session.user.email! };

    const existingUser = await prisma.user.findUnique({
      where: userWhere,
      select: { image: true },
    });

    if (existingUser?.image && existingUser.image.startsWith("/uploads/avatars/")) {
      const oldFilename = path.basename(existingUser.image);
      const oldFilePath = path.join(uploadsDir, oldFilename);
      try {
        if (fs.existsSync(oldFilePath)) {
          await fs.promises.unlink(oldFilePath);
        }
      } catch (_cleanupErr) {
        // Silently continue if old file cannot be deleted
      }
    }

    // 9. Write sanitized file
    await fs.promises.writeFile(filePath, sanitizedBuffer);
    const publicUrl = `/uploads/avatars/${filename}`;

    // 10. Update user profile in database
    await prisma.user.update({
      where: userWhere,
      data: { image: publicUrl },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "Profile picture uploaded and sanitized successfully",
    });
  } catch (error) {
    console.error("POST /api/user/upload-avatar error:", error);
    return NextResponse.json({ message: "Failed to upload image. Please try again." }, { status: 500 });
  }
}
