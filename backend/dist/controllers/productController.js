"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProduct = exports.getProducts = void 0;
const productService_1 = require("../services/productService");
const priceService_1 = require("../services/priceService");
const errorHandler_1 = require("../middleware/errorHandler");
const getProducts = async (_req, res, next) => {
    try {
        const products = await (0, productService_1.getAllProducts)('active');
        // Get variants for each product
        const productsWithVariants = await Promise.all(products.map(async (product) => {
            const variants = await (0, productService_1.getVariantsByProductId)(product.id);
            return { ...product, variants };
        }));
        res.status(200).json({
            success: true,
            data: { products: productsWithVariants }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await (0, productService_1.getProductBySlug)(slug);
        if (!product) {
            throw new errorHandler_1.ApiError(404, 'Product not found');
        }
        const variants = await (0, productService_1.getVariantsByProductId)(product.id);
        const decorationMethods = await (0, priceService_1.getDecorationMethods)();
        res.status(200).json({
            success: true,
            data: {
                product: { ...product, variants },
                decorationMethods
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProduct = getProduct;
//# sourceMappingURL=productController.js.map