/**
 * Initialize Supabase storage bucket
 * Creates the bucket if it doesn't exist
 */
export declare const initializeStorage: () => Promise<void>;
/**
 * Upload file to Supabase Storage
 * Returns the public URL of the uploaded file
 */
export declare const uploadToSupabase: (file: Express.Multer.File) => Promise<string>;
/**
 * Delete file from Supabase Storage
 */
export declare const deleteFromSupabase: (fileUrl: string) => Promise<void>;
/**
 * Check if Supabase storage is configured and available
 */
export declare const isSupabaseStorageAvailable: () => boolean;
//# sourceMappingURL=supabaseStorage.d.ts.map