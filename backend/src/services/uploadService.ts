import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pool from '../config/database';
import { Asset } from '../models/types';
import { ApiError } from '../middleware/errorHandler';

const UPLOAD_DIR = process.env.LOCAL_STORAGE_PATH || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const saveFile = async (
  file: Express.Multer.File,
  ownerType: string,
  ownerId?: string
): Promise<Asset> => {
  // Generate unique filename
  const hash = crypto.createHash('md5').update(file.buffer).digest('hex');
  const ext = path.extname(file.originalname);
  const filename = `${hash}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Save file to disk
  fs.writeFileSync(filepath, file.buffer);

  // Create asset record
  const result = await pool.query(
    `INSERT INTO assets (
      owner_type, owner_id, file_url, file_type, file_size, original_name, hash
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      ownerType,
      ownerId || null,
      `/uploads/${filename}`,
      file.mimetype,
      file.size,
      file.originalname,
      hash
    ]
  );

  return result.rows[0];
};

export const getAssetById = async (id: string): Promise<Asset | null> => {
  const result = await pool.query(
    'SELECT * FROM assets WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

export const deleteAsset = async (id: string): Promise<void> => {
  const asset = await getAssetById(id);

  if (!asset) {
    throw new ApiError(404, 'Asset not found');
  }

  // Delete file from disk
  const filepath = path.join(UPLOAD_DIR, path.basename(asset.file_url));
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }

  // Delete database record
  await pool.query('DELETE FROM assets WHERE id = $1', [id]);
};

export const validateFileType = (mimetype: string): boolean => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
  return allowedTypes.includes(mimetype) || [
    'image/png',
    'image/jpeg',
    'image/svg+xml',
    'application/pdf'
  ].includes(mimetype);
};

export const validateFileSize = (size: number): boolean => {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;
  return size <= maxSize;
};
