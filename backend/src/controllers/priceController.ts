import { Request, Response, NextFunction } from 'express';
import { calculatePrice } from '../services/priceService';
import { ApiError } from '../middleware/errorHandler';

export const calculateQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variant_id, method, placements, quantity } = req.body;

    if (!variant_id || !method || !placements || !quantity) {
      throw new ApiError(400, 'variant_id, method, placements, and quantity are required');
    }

    const quote = await calculatePrice(variant_id, method, placements, quantity);

    res.status(200).json({
      success: true,
      data: quote
    });
  } catch (error) {
    next(error);
  }
};
