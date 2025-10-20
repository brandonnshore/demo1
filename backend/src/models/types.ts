// TypeScript type definitions for Raspberry data models

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'fulfillment';
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  addresses: Address[];
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  materials?: string;
  weight?: number;
  country_of_origin?: string;
  status: 'active' | 'draft' | 'archived';
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Variant {
  id: string;
  product_id: string;
  color: string;
  size: string;
  sku: string;
  base_cost: number;
  base_price: number;
  stock_level: number;
  image_url?: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface DecorationMethod {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  allowed_products: string[] | 'all';
  pricing_rules: PricingRules;
  file_requirements: FileRequirements;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface PricingRules {
  base_price: number;
  per_color?: number;
  per_location?: number;
  per_1000_stitches?: number;
  per_square_inch?: number;
  quantity_breaks: QuantityBreak[];
}

export interface QuantityBreak {
  min: number;
  max: number | null;
  multiplier: number;
}

export interface FileRequirements {
  min_dpi?: number;
  accepted_formats: string[];
  max_colors?: number;
  max_size_inches?: number;
  full_color?: boolean;
}

export interface PriceRule {
  id: string;
  name: string;
  scope: 'product' | 'method' | 'global';
  entity_id?: string;
  min_qty: number;
  max_qty?: number;
  discount_type: 'percentage' | 'fixed_amount' | 'formula';
  discount_value?: number;
  formula?: Record<string, any>;
  active: boolean;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_intent_id?: string;
  production_status: 'pending' | 'in_production' | 'shipped' | 'cancelled';
  tracking_number?: string;
  carrier?: string;
  shipped_at?: Date;
  shipping_address: Address;
  billing_address?: Address;
  customer_notes?: string;
  internal_notes?: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  custom_spec: CustomizationSpec;
  production_pack_url?: string;
  mockup_url?: string;
  production_status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CustomizationSpec {
  method: string; // decoration_method name
  placements: Placement[];
  text_elements?: TextElement[];
  artwork_assets?: string[]; // asset IDs
  notes?: string;
}

export interface Placement {
  location: 'front_chest' | 'back_center' | 'sleeve_left' | 'sleeve_right' | 'cap_front' | 'cap_side';
  x: number; // inches from origin
  y: number; // inches from origin
  width: number; // inches
  height: number; // inches
  artwork_id?: string; // asset ID
  text_element_id?: string;
  colors: string[]; // Pantone or hex codes
  rotation?: number; // degrees
}

export interface TextElement {
  id: string;
  text: string;
  font_family: string;
  font_size: number;
  color: string;
  letter_spacing?: number;
  curved?: boolean;
  curve_radius?: number;
}

export interface Asset {
  id: string;
  owner_type: 'customer' | 'order' | 'product' | 'admin';
  owner_id?: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  original_name: string;
  hash?: string;
  width?: number;
  height?: number;
  dpi?: number;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  notes?: string;
  created_at: Date;
}

// Request/Response types
export interface PriceQuoteRequest {
  variant_id: string;
  method: string;
  placements: Placement[];
  quantity: number;
}

export interface PriceQuoteResponse {
  variant_price: number;
  decoration_price: number;
  quantity_discount: number;
  subtotal: number;
  breakdown: PriceBreakdown;
}

export interface PriceBreakdown {
  base_price: number;
  method_charges: MethodCharge[];
  quantity_multiplier: number;
  total: number;
}

export interface MethodCharge {
  description: string;
  amount: number;
}
