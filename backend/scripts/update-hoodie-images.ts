import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateHoodieImages() {
  try {
    const result = await pool.query(
      `UPDATE products
       SET images = '["/assets/hoodie-black-front.png", "/assets/hoodie-black-back.png"]'::jsonb
       WHERE slug = 'hoodie'
       RETURNING id, slug, title, images;`
    );

    if (result.rows.length > 0) {
      console.log('✓ Updated hoodie product images:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('⚠ No hoodie product found with slug "hoodie"');
    }
  } catch (error) {
    console.error('Error updating hoodie images:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateHoodieImages();
