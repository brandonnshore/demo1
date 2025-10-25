import { DecorationMethod, PriceQuoteResponse } from '../models/types';
export declare const calculatePrice: (variantId: string, methodName: string, placements: any[], quantity: number) => Promise<PriceQuoteResponse>;
export declare const getDecorationMethods: () => Promise<DecorationMethod[]>;
//# sourceMappingURL=priceService.d.ts.map