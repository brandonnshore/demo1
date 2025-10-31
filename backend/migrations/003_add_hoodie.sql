-- Add Hoodie product with Black color
-- Images: hoodie-black-front.png and hoodie-black-back.png

-- Insert Hoodie product
INSERT INTO products (title, slug, description, materials, weight, country_of_origin, images) VALUES
(
  'Classic Hoodie',
  'classic-hoodie',
  'Premium cotton blend hoodie. Soft, warm, and perfect for custom designs. Features adjustable drawstring hood and kangaroo pocket.',
  '80% Cotton, 20% Polyester',
  14.0,
  'USA',
  '[
    "/uploads/hoodie-black-front.png",
    "/uploads/hoodie-black-back.png"
  ]'::jsonb
);

-- Get the product ID for creating variants
DO $$
DECLARE
  product_uuid UUID;
BEGIN
  SELECT id INTO product_uuid FROM products WHERE slug = 'classic-hoodie';

  -- Insert variants for Hoodie (1 color x 5 sizes = 5 variants)
  INSERT INTO variants (product_id, color, size, sku, base_cost, base_price) VALUES
  -- Black variants
  (product_uuid, 'Black', 'S', 'HOODIE-BLK-S', 18.00, 35.99),
  (product_uuid, 'Black', 'M', 'HOODIE-BLK-M', 18.00, 35.99),
  (product_uuid, 'Black', 'L', 'HOODIE-BLK-L', 18.00, 35.99),
  (product_uuid, 'Black', 'XL', 'HOODIE-BLK-XL', 19.00, 37.99),
  (product_uuid, 'Black', '2XL', 'HOODIE-BLK-2XL', 20.00, 39.99);

END $$;
