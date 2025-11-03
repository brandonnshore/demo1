import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { Pool } from 'pg';
import * as path from 'path';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  process.exit(1);
}

if (!databaseUrl) {
  console.error('DATABASE_URL must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

const BUCKET_NAME = 'artwork-assets';

async function uploadImage(localPath: string, remotePath: string): Promise<string> {
  try {
    // Read the image file
    const imageBuffer = readFileSync(localPath);

    // Determine content type
    const ext = path.extname(localPath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

    // Upload to Supabase
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(remotePath, imageBuffer, {
        contentType,
        cacheControl: '31536000',
        upsert: true
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(remotePath);

    console.log(`✓ Uploaded ${localPath} -> ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Uploading hoodie images to Supabase...\n');

    // Upload front and back images
    const frontUrl = await uploadImage(
      path.resolve(__dirname, '../../public/assets/hoodie-black-front.png'),
      'products/hoodie-black-front.png'
    );

    const backUrl = await uploadImage(
      path.resolve(__dirname, '../../public/assets/hoodie-black-back.png'),
      'products/hoodie-black-back.png'
    );

    console.log('\nUpdating database...');

    // Update database with new URLs
    const result = await pool.query(
      `UPDATE products
       SET images = ARRAY[$1, $2]
       WHERE slug = 'hoodie'
       RETURNING id, slug, title, images;`,
      [frontUrl, backUrl]
    );

    if (result.rows.length > 0) {
      console.log('✓ Updated hoodie product in database:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('⚠ No hoodie product found with slug "hoodie"');
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
