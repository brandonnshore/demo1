import { Request, Response, NextFunction } from 'express';
import { getAllProducts, getProductBySlug, getVariantsByProductId } from '../services/productService';
import { getDecorationMethods } from '../services/priceService';
import { ApiError } from '../middleware/errorHandler';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await getAllProducts('active');

    // Get variants for each product
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await getVariantsByProductId(product.id);
        return { ...product, variants };
      })
    );

    res.status(200).json({
      success: true,
      data: { products: productsWithVariants }
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const product = await getProductBySlug(slug);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const variants = await getVariantsByProductId(product.id);
    const decorationMethods = await getDecorationMethods();

    res.status(200).json({
      success: true,
      data: {
        product: { ...product, variants },
        decorationMethods
      }
    });
  } catch (error) {
    next(error);
  }
};
