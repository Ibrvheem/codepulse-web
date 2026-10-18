import "server-only";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * Where narrated lines live for good. A line is keyed by the voice and the
 * exact text, so the same words in the same voice are synthesised once and
 * served from here forever after, whatever happens to a server's memory or
 * the CDN. Without R2 configured every call falls through to ElevenLabs.
 */

let client: S3Client | null = null;

function configured(): boolean {
  return Boolean(process.env.R2_BUCKET && process.env.R2_ENDPOINT);
}

function s3(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: process.env.R2_ENDPOINT,
      region: process.env.R2_REGION ?? "auto",
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return client;
}

export async function readVoice(key: string): Promise<ArrayBuffer | null> {
  if (!configured()) return null;
  try {
    const res = await s3().send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: `voice/${key}.mp3`,
      }),
    );
    const bytes = await res.Body?.transformToByteArray();
    if (!bytes) return null;
    // A fresh buffer: the SDK may hand back a view on shared memory.
    const out = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(out).set(bytes);
    return out;
  } catch {
    return null; // missing, or R2 unreachable: either way, synthesise
  }
}

export async function writeVoice(
  key: string,
  audio: ArrayBuffer,
): Promise<void> {
  if (!configured()) return;
  try {
    await s3().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: `voice/${key}.mp3`,
        Body: Buffer.from(audio),
        ContentType: "audio/mpeg",
      }),
    );
  } catch (error) {
    // The line still plays; it will just be synthesised again next time.
    console.error("voice store write failed", error);
  }
}
