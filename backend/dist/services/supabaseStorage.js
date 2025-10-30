"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupabaseStorageAvailable = exports.deleteFromSupabase = exports.uploadToSupabase = exports.initializeStorage = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase storage not configured - using local storage fallback');
}
const supabase = supabaseUrl && supabaseServiceKey
    ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey)
    : null;
const BUCKET_NAME = 'artwork-assets';
/**
 * Initialize Supabase storage bucket
 * Creates the bucket if it doesn't exist
 */
const initializeStorage = async () => {
    if (!supabase)
        return;
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
    }
    catch (error) {
        console.error('Failed to initialize Supabase storage:', error);
    }
};
exports.initializeStorage = initializeStorage;
/**
 * Upload file to Supabase Storage
 * Returns the public URL of the uploaded file
 */
const uploadToSupabase = async (file) => {
    if (!supabase) {
        throw new Error('Supabase storage not configured');
    }
    // Generate unique filename
    const hash = crypto_1.default.createHash('md5').update(file.buffer).digest('hex');
    const ext = path_1.default.extname(file.originalname);
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
exports.uploadToSupabase = uploadToSupabase;
/**
 * Delete file from Supabase Storage
 */
const deleteFromSupabase = async (fileUrl) => {
    if (!supabase)
        return;
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
    }
    catch (error) {
        console.error('Failed to delete from Supabase:', error);
    }
};
exports.deleteFromSupabase = deleteFromSupabase;
/**
 * Check if Supabase storage is configured and available
 */
const isSupabaseStorageAvailable = () => {
    return supabase !== null;
};
exports.isSupabaseStorageAvailable = isSupabaseStorageAvailable;
//# sourceMappingURL=supabaseStorage.js.map