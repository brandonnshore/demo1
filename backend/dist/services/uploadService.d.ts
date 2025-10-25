import { Asset } from '../models/types';
export declare const saveFile: (file: Express.Multer.File, ownerType: string, ownerId?: string) => Promise<Asset>;
export declare const getAssetById: (id: string) => Promise<Asset | null>;
export declare const deleteAsset: (id: string) => Promise<void>;
export declare const validateFileType: (mimetype: string) => boolean;
export declare const validateFileSize: (size: number) => boolean;
//# sourceMappingURL=uploadService.d.ts.map