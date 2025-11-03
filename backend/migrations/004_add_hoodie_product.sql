-- Create hoodie product (completely independent from t-shirt)
INSERT INTO products (
  id,
  title,
  slug,
  description,
  images,
  materials,
  weight,
  country_of_origin,
  status
) VALUES (
  gen_random_uuid(),
  'Classic Hoodie',
  'hoodie',
  'Premium heavyweight hoodie. Soft fleece interior, adjustable drawstring hood, and kangaroo pocket. Perfect for custom designs.',
  '["\/uploads\/hoodie-black-front.png", "\/uploads\/hoodie-black-back.png"]'::jsonb,
  '80% Cotton, 20% Polyester',
  14.00,
  'USA',
  'active'
) RETURNING id;

-- Get the product ID we just created (for reference)
-- Then add variants for the hoodie
WITH hoodie AS (
  SELECT id FROM products WHERE slug = 'hoodie'
)
INSERT INTO variants (product_id, color, size, sku, base_cost, base_price, stock_level)
SELECT
  hoodie.id,
  color,
  size,
  'HOODIE-BLK-' || size,
  CASE
    WHEN size IN ('S', 'M', 'L') THEN 18.00
    WHEN size = 'XL' THEN 19.00
    WHEN size = '2XL' THEN 20.00
  END,
  CASE
    WHEN size IN ('S', 'M', 'L') THEN 35.99
    WHEN size = 'XL' THEN 37.99
    WHEN size = '2XL' THEN 39.99
  END,
  0
FROM hoodie,
  (VALUES ('Black', 'S'), ('Black', 'M'), ('Black', 'L'), ('Black', 'XL'), ('Black', '2XL')) AS v(color, size);
