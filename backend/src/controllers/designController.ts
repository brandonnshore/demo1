import { Response, NextFunction } from 'express';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import {
  createDesign,
  getUserDesigns,
  getDesignById,
  updateDesignById,
  deleteDesignById
} from '../services/designService';

export const saveDesign = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { name, productId, variantId, designData, artworkIds, thumbnailUrl, notes } = req.body;

    if (!name || !productId || !designData) {
      throw new ApiError(400, 'Name, productId, and designData are required');
    }

    const design = await createDesign({
      userId: req.user.id,
      name,
      productId,
      variantId,
      designData,
      artworkIds: artworkIds || [],
      thumbnailUrl,
      notes
    });

    res.status(201).json({
      success: true,
      data: { design }
    });
  } catch (error) {
    next(error);
  }
};

export const getDesigns = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const designs = await getUserDesigns(req.user.id);

    res.status(200).json({
      success: true,
      data: { designs }
    });
  } catch (error) {
    next(error);
  }
};

export const getDesign = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;
    const design = await getDesignById(id, req.user.id);

    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    res.status(200).json({
      success: true,
      data: { design }
    });
  } catch (error) {
    next(error);
  }
};

export const updateDesign = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;
    const { name, variantId, designData, artworkIds, thumbnailUrl, notes } = req.body;

    const design = await updateDesignById(id, req.user.id, {
      name,
      variantId,
      designData,
      artworkIds,
      thumbnailUrl,
      notes
    });

    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    res.status(200).json({
      success: true,
      data: { design }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDesign = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;
    const deleted = await deleteDesignById(id, req.user.id);

    if (!deleted) {
      throw new ApiError(404, 'Design not found');
    }

    res.status(200).json({
      success: true,
      data: { message: 'Design deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};
