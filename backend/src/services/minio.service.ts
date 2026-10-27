import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} must be configured`);
  }
  return value;
}

const bucket = requiredEnv("MINIO_BUCKET", process.env["MINIO_BUCKET"]);
const endpoint = requiredEnv("MINIO_ENDPOINT", process.env["MINIO_ENDPOINT"]);
const accessKeyId = requiredEnv(
  "MINIO_ACCESS_KEY or MINIO_ROOT_USER",
  process.env["MINIO_ACCESS_KEY"] ?? process.env["MINIO_ROOT_USER"],
);
const secretAccessKey = requiredEnv(
  "MINIO_SECRET_KEY or MINIO_ROOT_PASSWORD",
  process.env["MINIO_SECRET_KEY"] ?? process.env["MINIO_ROOT_PASSWORD"],
);
const publicEndpoint =
  process.env["MINIO_PUBLIC_ENDPOINT"] ?? "http://localhost:9000";

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

export class MinioService {
  static async uploadFile(file: Express.Multer.File): Promise<string> {
    const extension = extname(file.originalname).toLowerCase();
    const safeExtension = /^\.[a-z0-9]{1,10}$/.test(extension)
      ? extension
      : "";
    const key = `${randomUUID()}${safeExtension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${publicEndpoint.replace(/\/+$/, "")}/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`;
  }
}
