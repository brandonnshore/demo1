import pool from '../config/database';

interface SavedDesign {
  id: string;
  user_id: string;
  name: string;
  product_id: string;
  variant_id?: string;
  design_data: unknown;
  artwork_ids: string[];
  thumbnail_url?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateDesignParams {
  userId: string;
  name: string;
  productId: string;
  variantId?: string;
  designData: any;
  artworkIds: string[];
  thumbnailUrl?: string;
  notes?: string;
}

interface UpdateDesignParams {
  name?: string;
  variantId?: string;
  designData?: any;
  artworkIds?: string[];
  thumbnailUrl?: string;
  notes?: string;
}

export const createDesign = async (params: CreateDesignParams): Promise<SavedDesign> => {
  const { userId, name, productId, variantId, designData, artworkIds, thumbnailUrl, notes } = params;

  const result = await pool.query(
    `INSERT INTO saved_designs (user_id, name, product_id, variant_id, design_data, artwork_ids, thumbnail_url, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [userId, name, productId, variantId || null, JSON.stringify(designData), JSON.stringify(artworkIds), thumbnailUrl, notes]
  );

  return result.rows[0];
};

export const getUserDesigns = async (userId: string): Promise<SavedDesign[]> => {
  const result = await pool.query(
    `SELECT sd.*, p.title as product_title, p.slug as product_slug
     FROM saved_designs sd
     LEFT JOIN products p ON sd.product_id = p.id
     WHERE sd.user_id = $1
     ORDER BY sd.updated_at DESC`,
    [userId]
  );

  return result.rows;
};

export const getDesignById = async (designId: string, userId: string): Promise<SavedDesign | null> => {
  const result = await pool.query(
    `SELECT sd.*, p.title as product_title, p.slug as product_slug, v.color as variant_color, v.size as variant_size
     FROM saved_designs sd
     LEFT JOIN products p ON sd.product_id = p.id
     LEFT JOIN variants v ON sd.variant_id = v.id
     WHERE sd.id = $1 AND sd.user_id = $2`,
    [designId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const design = result.rows[0];

  // Fetch artwork URLs from assets table
  if (design.artwork_ids && Array.isArray(design.artwork_ids) && design.artwork_ids.length > 0) {
    const artworkResult = await pool.query(
      `SELECT id, file_url FROM assets WHERE id = ANY($1)`,
      [design.artwork_ids]
    );

    // Create a map of asset IDs to URLs
    const artworkUrls: { [key: string]: string } = {};
    artworkResult.rows.forEach((row: any) => {
      artworkUrls[row.id] = row.file_url;
    });

    design.artwork_urls = artworkUrls;
  }

  return design;
};

export const updateDesignById = async (
  designId: string,
  userId: string,
  params: UpdateDesignParams
): Promise<SavedDesign | null> => {
  const existing = await getDesignById(designId, userId);
  if (!existing) {
    return null;
  }

  // Build dynamic update query
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (params.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(params.name);
  }
  if (params.variantId !== undefined) {
    updates.push(`variant_id = $${paramCount++}`);
    values.push(params.variantId);
  }
  if (params.designData !== undefined) {
    updates.push(`design_data = $${paramCount++}`);
    values.push(JSON.stringify(params.designData));
  }
  if (params.artworkIds !== undefined) {
    updates.push(`artwork_ids = $${paramCount++}`);
    values.push(JSON.stringify(params.artworkIds));
  }
  if (params.thumbnailUrl !== undefined) {
    updates.push(`thumbnail_url = $${paramCount++}`);
    values.push(params.thumbnailUrl);
  }
  if (params.notes !== undefined) {
    updates.push(`notes = $${paramCount++}`);
    values.push(params.notes);
  }

  if (updates.length === 0) {
    return existing;
  }

  values.push(designId, userId);

  const result = await pool.query(
    `UPDATE saved_designs
     SET ${updates.join(', ')}
     WHERE id = $${paramCount++} AND user_id = $${paramCount}
     RETURNING *`,
    values
  );

  return result.rows[0];
};

export const deleteDesignById = async (designId: string, userId: string): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM saved_designs WHERE id = $1 AND user_id = $2',
    [designId, userId]
  );

  return result.rowCount !== null && result.rowCount > 0;
};
