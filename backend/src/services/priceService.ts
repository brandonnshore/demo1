import pool from '../config/database';
import { DecorationMethod, Variant, PriceQuoteResponse, PriceBreakdown, MethodCharge } from '../models/types';
import { ApiError } from '../middleware/errorHandler';

export const calculatePrice = async (
  variantId: string,
  methodName: string,
  placements: any[],
  quantity: number
): Promise<PriceQuoteResponse> => {
  // Get variant
  const variantResult = await pool.query('SELECT * FROM variants WHERE id = $1', [variantId]);
  if (variantResult.rows.length === 0) {
    throw new ApiError(404, 'Variant not found');
  }
  const variant: Variant = variantResult.rows[0];

  // Get decoration method
  const methodResult = await pool.query('SELECT * FROM decoration_methods WHERE name = $1', [methodName]);
  if (methodResult.rows.length === 0) {
    throw new ApiError(404, 'Decoration method not found');
  }
  const method: DecorationMethod = methodResult.rows[0];

  // Calculate base variant price
  const variantPrice = variant.base_price;

  // Calculate decoration costs
  const pricingRules = method.pricing_rules;
  let decorationPrice = pricingRules.base_price || 0;
  const methodCharges: MethodCharge[] = [];

  methodCharges.push({
    description: `${method.display_name} - Base`,
    amount: pricingRules.base_price
  });

  // Add per-location charges
  if (pricingRules.per_location) {
    const locationCharge = pricingRules.per_location * placements.length;
    decorationPrice += locationCharge;
    methodCharges.push({
      description: `Placements (${placements.length})`,
      amount: locationCharge
    });
  }

  // Add per-color charges (screen print)
  if (pricingRules.per_color) {
    const totalColors = placements.reduce((sum, p) => sum + (p.colors?.length || 0), 0);
    const colorCharge = pricingRules.per_color * totalColors;
    decorationPrice += colorCharge;
    methodCharges.push({
      description: `Colors (${totalColors})`,
      amount: colorCharge
    });
  }

  // Add per square inch charges (DTG)
  if (pricingRules.per_square_inch) {
    const totalArea = placements.reduce((sum, p) => sum + (p.width * p.height), 0);
    const areaCharge = pricingRules.per_square_inch * totalArea;
    decorationPrice += areaCharge;
    methodCharges.push({
      description: `Print area (${totalArea.toFixed(1)} sq in)`,
      amount: areaCharge
    });
  }

  // Calculate quantity multiplier from method pricing rules
  let quantityMultiplier = 1.0;
  if (pricingRules.quantity_breaks) {
    for (const qtyBreak of pricingRules.quantity_breaks) {
      if (quantity >= qtyBreak.min && (qtyBreak.max === null || quantity <= qtyBreak.max)) {
        quantityMultiplier = qtyBreak.multiplier;
        break;
      }
    }
  }

  // Apply decoration quantity multiplier
  const adjustedDecorationPrice = decorationPrice * quantityMultiplier;

  // Calculate item subtotal (variant + decoration)
  const itemTotal = variantPrice + adjustedDecorationPrice;

  // Check for global quantity discounts
  const globalDiscountResult = await pool.query(
    `SELECT * FROM price_rules
     WHERE scope = 'global'
     AND active = true
     AND min_qty <= $1
     AND (max_qty IS NULL OR max_qty >= $1)
     ORDER BY priority DESC
     LIMIT 1`,
    [quantity]
  );

  let quantityDiscount = 0;
  if (globalDiscountResult.rows.length > 0) {
    const rule = globalDiscountResult.rows[0];
    if (rule.discount_type === 'percentage') {
      quantityDiscount = (itemTotal * quantity * rule.discount_value) / 100;
    } else if (rule.discount_type === 'fixed_amount') {
      quantityDiscount = rule.discount_value * quantity;
    }
  }

  const subtotal = (itemTotal * quantity) - quantityDiscount;

  const breakdown: PriceBreakdown = {
    base_price: variantPrice,
    method_charges: methodCharges,
    quantity_multiplier: quantityMultiplier,
    total: itemTotal
  };

  return {
    variant_price: variantPrice,
    decoration_price: adjustedDecorationPrice,
    quantity_discount: quantityDiscount,
    subtotal,
    breakdown
  };
};

export const getDecorationMethods = async (): Promise<DecorationMethod[]> => {
  const result = await pool.query(
    'SELECT * FROM decoration_methods WHERE status = $1',
    ['active']
  );
  return result.rows;
};
