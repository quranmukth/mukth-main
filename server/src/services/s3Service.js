/**
 * @service S3Service
 * @description AWS S3 integration for audio recording uploads.
 * Strategy: Presigned PUT URL — server stays lean (doesn't proxy audio bytes).
 *
 * Flow:
 *   1. Client calls POST /recordings/upload-url → gets presigned PUT URL + s3Key
 *   2. Client uploads directly to S3 using the PUT URL
 *   3. Client calls POST /recordings with the s3Key to save metadata
 *   4. Client calls GET /recordings/:id/url to get a presigned GET URL for playback
 */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import logger from '../config/logger.js';

// ─── Client ───────────────────────────────────────────────────────────────────

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;
const UPLOAD_EXPIRY = 300;   // 5 minutes for upload
const PLAY_EXPIRY = 3600;    // 1 hour for playback

// ─── Service ──────────────────────────────────────────────────────────────────

const S3Service = {
  /**
   * Generate a presigned PUT URL so the client can upload directly to S3.
   * @param {string} studentId - Used to namespace the S3 key
   * @param {string} contentType - e.g. 'audio/webm'
   * @returns {{ uploadUrl: string, s3Key: string }}
   */
  getUploadUrl: async (studentId, contentType = 'audio/webm') => {
    const ext = contentType.split('/')[1] || 'webm';
    const s3Key = `recordings/${studentId}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: UPLOAD_EXPIRY });
    logger.debug(`Generated S3 upload URL for key: ${s3Key}`);

    return { uploadUrl, s3Key };
  },

  /**
   * Generate a presigned GET URL for audio playback (short-lived).
   * @param {string} s3Key
   * @returns {string} Presigned GET URL
   */
  getPlaybackUrl: async (s3Key) => {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: s3Key });
    return getSignedUrl(s3, command, { expiresIn: PLAY_EXPIRY });
  },

  /**
   * Permanently delete a recording from S3.
   * @param {string} s3Key
   */
  deleteObject: async (s3Key) => {
    const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key });
    await s3.send(command);
    logger.info(`Deleted S3 object: ${s3Key}`);
  },
};

export default S3Service;
