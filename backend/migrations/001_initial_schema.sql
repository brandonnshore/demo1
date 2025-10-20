-- Initial Database Schema for Raspberry Ecommerce Platform
-- Creates all core tables for products, orders, customers, and assets

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (admin and fulfillment users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'fulfillment', -- 'admin', 'fulfillment'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  addresses JSONB DEFAULT '[]'::jsonb, -- Array of address objects
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  materials VARCHAR(255),
  weight DECIMAL(10, 2), -- in ounces or grams
  country_of_origin VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'draft', 'archived'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product variants table
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color VARCHAR(100) NOT NULL,
  size VARCHAR(50) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  base_cost DECIMAL(10, 2) NOT NULL, -- Cost to produce
  base_price DECIMAL(10, 2) NOT NULL, -- Selling price before customization
  stock_level INTEGER DEFAULT 0,
  image_url VARCHAR(500),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, color, size)
);

-- Decoration methods table
CREATE TABLE decoration_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL, -- 'screen_print', 'embroidery', 'leather_patch', 'dtg'
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  allowed_products JSONB DEFAULT '[]'::jsonb, -- Array of product IDs or 'all'
  pricing_rules JSONB NOT NULL, -- Complex pricing rules in JSON format
  file_requirements JSONB DEFAULT '{}'::jsonb, -- Min resolution, accepted formats, etc.
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Price rules table
CREATE TABLE price_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  scope VARCHAR(100) NOT NULL, -- 'product', 'method', 'global'
  entity_id UUID, -- product_id or method_id (null for global)
  min_qty INTEGER NOT NULL DEFAULT 1,
  max_qty INTEGER, -- null means no max
  discount_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount', 'formula'
  discount_value DECIMAL(10, 2),
  formula JSONB, -- Complex calculation formula
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority rules apply first
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),

  -- Pricing totals
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,

  -- Payment info
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  payment_method VARCHAR(100),
  payment_intent_id VARCHAR(255), -- Stripe payment intent ID

  -- Fulfillment info
  production_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_production', 'shipped', 'cancelled'
  tracking_number VARCHAR(255),
  carrier VARCHAR(100),
  shipped_at TIMESTAMP WITH TIME ZONE,

  -- Addresses
  shipping_address JSONB NOT NULL,
  billing_address JSONB,

  -- Additional data
  customer_notes TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES variants(id),

  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,

  -- Customization specification
  custom_spec JSONB NOT NULL, -- Decoration method, placements, artwork, text, etc.

  -- Production outputs
  production_pack_url VARCHAR(500), -- URL to zipped production pack
  mockup_url VARCHAR(500), -- URL to customer-facing mockup

  production_status VARCHAR(50) DEFAULT 'pending',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assets table (logos, uploaded artwork, mockups, etc.)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type VARCHAR(50) NOT NULL, -- 'customer', 'order', 'product', 'admin'
  owner_id UUID, -- Reference to owner entity

  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL, -- MIME type
  file_size INTEGER, -- in bytes
  original_name VARCHAR(255) NOT NULL,
  hash VARCHAR(255), -- For deduplication

  -- Image-specific metadata
  width INTEGER,
  height INTEGER,
  dpi INTEGER,

  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order status history (audit trail)
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_variants_product_id ON variants(product_id);
CREATE INDEX idx_variants_sku ON variants(sku);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_production_status ON orders(production_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX idx_assets_owner ON assets(owner_type, owner_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_decoration_methods_updated_at BEFORE UPDATE ON decoration_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_rules_updated_at BEFORE UPDATE ON price_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
