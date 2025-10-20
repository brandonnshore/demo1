const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://brandonshore@localhost:5432/raspberry'
});

async function updateProducts() {
  const client = await pool.connect();
  try {
    // Update all existing prices to 12.98
    const updateResult = await client.query(`
      UPDATE variants
      SET base_price = 12.98
      WHERE product_id IN (SELECT id FROM products WHERE slug = 'classic-tee')
    `);
    console.log(`✅ Updated ${updateResult.rowCount} variants to $12.98`);

    // Get product ID
    const productResult = await client.query(`SELECT id FROM products WHERE slug = 'classic-tee'`);
    const productId = productResult.rows[0]?.id;

    if (productId) {
      // Add Navy variants
      const insertResult = await client.query(`
        INSERT INTO variants (product_id, color, size, sku, base_cost, base_price) VALUES
        ($1, 'Navy', 'S', 'TEE-NVY-S', 5.00, 12.98),
        ($1, 'Navy', 'M', 'TEE-NVY-M', 5.00, 12.98),
        ($1, 'Navy', 'L', 'TEE-NVY-L', 5.00, 12.98),
        ($1, 'Navy', 'XL', 'TEE-NVY-XL', 5.50, 12.98),
        ($1, 'Navy', '2XL', 'TEE-NVY-2XL', 6.00, 12.98)
        ON CONFLICT (product_id, color, size) DO NOTHING
      `, [productId]);

      console.log(`✅ Added ${insertResult.rowCount} Navy color variants`);
    }

    // Show total
    const countResult = await client.query(`
      SELECT COUNT(*) FROM variants WHERE product_id IN (SELECT id FROM products WHERE slug = 'classic-tee')
    `);
    console.log(`✅ Total variants now: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

updateProducts();
