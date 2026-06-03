import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

/* -------------------- Cloudinary config -------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_MAGIC_BYTES = [
  { bytes: [0xff, 0xd8, 0xff], label: "JPEG" },
  { bytes: [0x89, 0x50, 0x4e, 0x47], label: "PNG" },
  { bytes: [0x47, 0x49, 0x46, 0x38], label: "GIF" },
];

function validateMagicBytes(buffer) {
  if (!buffer || buffer.length < 4) return false;

  for (const { bytes } of ALLOWED_MAGIC_BYTES) {
    if (bytes.every((byte, i) => buffer[i] === byte)) return true;
  }

  const isRiff =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46;
  const isWebp =
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  return isRiff && isWebp;
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new Error(
        `Invalid file type: "${file.mimetype}". ` +
          `Allowed types: ${[...ALLOWED_MIME_TYPES].join(", ")}.`,
      ),
      false,
    );
  }
  cb(null, true);
}

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

// For project creation — allow thumbnail + banner + up to 10 gallery images
export const uploadProjectImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 12, // 1 thumbnail + 1 banner + 10 gallery
  },
});

export async function uploadToCloudinary(file, folder = "portfolio/projects") {
  if (!file || !file.buffer) {
    throw new Error("No file buffer received.");
  }

  if (!validateMagicBytes(file.buffer)) {
    throw new Error(
      "File content does not match an allowed image format. Upload rejected.",
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve(result);
        }
      },
    );

    stream.end(file.buffer);
  });
}

export { cloudinary };
