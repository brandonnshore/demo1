interface SavedDesign {
    id: string;
    user_id: string;
    name: string;
    product_id: string;
    variant_id?: string;
    design_data: unknown;
    artwork_ids: string[];
    thumbnail_url?: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}
interface CreateDesignParams {
    userId: string;
    name: string;
    productId: string;
    variantId?: string;
    designData: any;
    artworkIds: string[];
    thumbnailUrl?: string;
    notes?: string;
}
interface UpdateDesignParams {
    name?: string;
    variantId?: string;
    designData?: any;
    artworkIds?: string[];
    thumbnailUrl?: string;
    notes?: string;
}
export declare const createDesign: (params: CreateDesignParams) => Promise<SavedDesign>;
export declare const getUserDesigns: (userId: string) => Promise<SavedDesign[]>;
export declare const getDesignById: (designId: string, userId: string) => Promise<SavedDesign | null>;
export declare const updateDesignById: (designId: string, userId: string, params: UpdateDesignParams) => Promise<SavedDesign | null>;
export declare const deleteDesignById: (designId: string, userId: string) => Promise<boolean>;
export {};
//# sourceMappingURL=designService.d.ts.map