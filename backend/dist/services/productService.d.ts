import { Product, Variant } from '../models/types';
export declare const getAllProducts: (status?: string) => Promise<Product[]>;
export declare const getProductBySlug: (slug: string) => Promise<Product | null>;
export declare const getProductById: (id: string) => Promise<Product | null>;
export declare const getVariantsByProductId: (productId: string) => Promise<Variant[]>;
export declare const getVariantById: (id: string) => Promise<Variant | null>;
export declare const createProduct: (productData: any) => Promise<Product>;
export declare const updateProduct: (id: string, productData: Record<string, unknown>) => Promise<Product>;
export declare const deleteProduct: (id: string) => Promise<void>;
//# sourceMappingURL=productService.d.ts.map