-- Seed data for Raspberry MVP
-- Creates initial products, decoration methods, and admin user

-- Insert default admin user (password: 'admin123' - CHANGE IN PRODUCTION)
-- Password hash generated with bcrypt rounds=10
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@raspberry.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'admin');

-- Insert decoration methods
INSERT INTO decoration_methods (name, display_name, description, pricing_rules, file_requirements) VALUES
('screen_print', 'Screen Print', 'Traditional screen printing - best for bold designs with limited colors',
  '{
    "base_price": 5.00,
    "per_color": 1.50,
    "per_location": 3.00,
    "quantity_breaks": [
      {"min": 1, "max": 11, "multiplier": 1.0},
      {"min": 12, "max": 23, "multiplier": 0.85},
      {"min": 24, "max": 49, "multiplier": 0.70},
      {"min": 50, "max": null, "multiplier": 0.60}
    ]
  }'::jsonb,
  '{
    "min_dpi": 300,
    "accepted_formats": ["png", "svg", "pdf", "ai"],
    "max_colors": 6
  }'::jsonb
),
('embroidery', 'Embroidery', 'Professional embroidery - great for logos and text',
  '{
    "base_price": 8.00,
    "per_1000_stitches": 0.50,
    "per_location": 5.00,
    "quantity_breaks": [
      {"min": 1, "max": 11, "multiplier": 1.0},
      {"min": 12, "max": 23, "multiplier": 0.90},
      {"min": 24, "max": null, "multiplier": 0.80}
    ]
  }'::jsonb,
  '{
    "min_dpi": 300,
    "accepted_formats": ["dst", "png", "svg", "pdf"],
    "max_size_inches": 4
  }'::jsonb
),
('dtg', 'Direct to Garment', 'Full-color digital printing - perfect for complex designs',
  '{
    "base_price": 10.00,
    "per_square_inch": 0.15,
    "per_location": 6.00,
    "quantity_breaks": [
      {"min": 1, "max": 5, "multiplier": 1.0},
      {"min": 6, "max": 11, "multiplier": 0.95},
      {"min": 12, "max": null, "multiplier": 0.85}
    ]
  }'::jsonb,
  '{
    "min_dpi": 300,
    "accepted_formats": ["png", "jpg", "pdf"],
    "full_color": true
  }'::jsonb
);

-- Insert MVP product: Classic T-Shirt
INSERT INTO products (title, slug, description, materials, weight, country_of_origin, images) VALUES
(
  'Classic Cotton T-Shirt',
  'classic-tee',
  'Premium 100% cotton t-shirt. Soft, comfortable, and perfect for custom designs. Pre-shrunk fabric ensures lasting fit.',
  '100% Cotton',
  6.0,
  'USA',
  '[
    "/images/products/classic-tee-front.jpg",
    "/images/products/classic-tee-back.jpg"
  ]'::jsonb
);

-- Get the product ID for creating variants
DO $$
DECLARE
  product_uuid UUID;
BEGIN
  SELECT id INTO product_uuid FROM products WHERE slug = 'classic-tee';

  -- Insert variants for Classic T-Shirt (2 colors x 5 sizes = 10 variants)
  INSERT INTO variants (product_id, color, size, sku, base_cost, base_price) VALUES
  -- Black variants
  (product_uuid, 'Black', 'S', 'TEE-BLK-S', 5.00, 12.99),
  (product_uuid, 'Black', 'M', 'TEE-BLK-M', 5.00, 12.99),
  (product_uuid, 'Black', 'L', 'TEE-BLK-L', 5.00, 12.99),
  (product_uuid, 'Black', 'XL', 'TEE-BLK-XL', 5.50, 13.99),
  (product_uuid, 'Black', '2XL', 'TEE-BLK-2XL', 6.00, 14.99),

  -- White variants
  (product_uuid, 'White', 'S', 'TEE-WHT-S', 5.00, 12.99),
  (product_uuid, 'White', 'M', 'TEE-WHT-M', 5.00, 12.99),
  (product_uuid, 'White', 'L', 'TEE-WHT-L', 5.00, 12.99),
  (product_uuid, 'White', 'XL', 'TEE-WHT-XL', 5.50, 13.99),
  (product_uuid, 'White', '2XL', 'TEE-WHT-2XL', 6.00, 14.99);

END $$;

-- Insert quantity-based price rules
INSERT INTO price_rules (name, scope, min_qty, max_qty, discount_type, discount_value, active, priority) VALUES
('Bulk Discount - 12+', 'global', 12, 23, 'percentage', 10.00, true, 1),
('Bulk Discount - 24+', 'global', 24, 49, 'percentage', 15.00, true, 2),
('Bulk Discount - 50+', 'global', 50, null, 'percentage', 20.00, true, 3);
