import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase storage not configured - using local storage fallback');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const BUCKET_NAME = 'artwork-assets';

/**
 * Initialize Supabase storage bucket
 * Creates the bucket if it doesn't exist
 */
export const initializeStorage = async (): Promise<void> => {
  if (!supabase) return;

  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket with public access for artwork
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/svg+xml',
          'application/pdf',
          'application/postscript' // .ai files
        ]
      });
      console.log('✅ Supabase storage bucket created:', BUCKET_NAME);
    }
  } catch (error) {
    console.error('Failed to initialize Supabase storage:', error);
  }
};

/**
 * Upload file to Supabase Storage
 * Returns the public URL of the uploaded file
 */
export const uploadToSupabase = async (
  file: Express.Multer.File
): Promise<string> => {
  if (!supabase) {
    throw new Error('Supabase storage not configured');
  }

  // Generate unique filename
  const hash = crypto.createHash('md5').update(file.buffer).digest('hex');
  const ext = path.extname(file.originalname);
  const filename = `${hash}${ext}`;
  const filepath = `artwork/${filename}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filepath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '31536000', // 1 year cache
      upsert: true // Overwrite if exists
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filepath);

  return data.publicUrl;
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFromSupabase = async (fileUrl: string): Promise<void> => {
  if (!supabase) return;

  try {
    // Extract filepath from URL
    const url = new URL(fileUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)/);

    if (pathMatch && pathMatch[1]) {
      const filepath = pathMatch[1];
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([filepath]);
    }
  } catch (error) {
    console.error('Failed to delete from Supabase:', error);
  }
};

/**
 * Check if Supabase storage is configured and available
 */
export const isSupabaseStorageAvailable = (): boolean => {
  return supabase !== null;
};
