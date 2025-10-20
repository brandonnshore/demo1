import pool from '../config/database';
import { Product, Variant } from '../models/types';
import { ApiError } from '../middleware/errorHandler';

export const getAllProducts = async (status: string = 'active'): Promise<Product[]> => {
  const result = await pool.query(
    'SELECT * FROM products WHERE status = $1 ORDER BY created_at DESC',
    [status]
  );
  return result.rows;
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const result = await pool.query(
    'SELECT * FROM products WHERE slug = $1 AND status = $2',
    [slug, 'active']
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

export const getVariantsByProductId = async (productId: string): Promise<Variant[]> => {
  const result = await pool.query(
    'SELECT * FROM variants WHERE product_id = $1 ORDER BY color, size',
    [productId]
  );
  return result.rows;
};

export const getVariantById = async (id: string): Promise<Variant | null> => {
  const result = await pool.query(
    'SELECT * FROM variants WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

export const createProduct = async (productData: any): Promise<Product> => {
  const { title, slug, description, images, materials, weight, country_of_origin } = productData;

  const result = await pool.query(
    `INSERT INTO products (title, slug, description, images, materials, weight, country_of_origin, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
     RETURNING *`,
    [title, slug, description, JSON.stringify(images || []), materials, weight, country_of_origin]
  );

  return result.rows[0];
};

export const updateProduct = async (id: string, productData: any): Promise<Product> => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(productData).forEach((key) => {
    if (key === 'images') {
      fields.push(`${key} = $${paramCount}`);
      values.push(JSON.stringify(productData[key]));
    } else {
      fields.push(`${key} = $${paramCount}`);
      values.push(productData[key]);
    }
    paramCount++;
  });

  values.push(id);

  const result = await pool.query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Product not found');
  }

  return result.rows[0];
};

export const deleteProduct = async (id: string): Promise<void> => {
  const result = await pool.query(
    `UPDATE products SET status = 'archived' WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Product not found');
  }
};
