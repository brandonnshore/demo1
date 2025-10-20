// Frontend type definitions (matching backend types)

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
  variants?: Variant[];
}

export interface Variant {
  id: string;
  product_id: string;
  color: string;
  size: string;
  sku: string;
  base_price: number;
  stock_level: number;
  image_url?: string;
}

export interface DecorationMethod {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  pricing_rules: PricingRules;
  file_requirements: FileRequirements;
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

export interface Placement {
  location: 'front_chest' | 'back_center' | 'sleeve_left' | 'sleeve_right' | 'cap_front' | 'cap_side';
  x: number;
  y: number;
  width: number;
  height: number;
  artwork_id?: string;
  text_element_id?: string;
  colors: string[];
  rotation?: number;
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

export interface CustomizationSpec {
  method: string;
  placements: Placement[];
  text_elements?: TextElement[];
  artwork_assets?: string[];
  notes?: string;
}

export interface PriceQuote {
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
