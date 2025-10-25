import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const saveDesign: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getDesigns: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getDesign: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateDesign: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteDesign: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=designController.d.ts.map