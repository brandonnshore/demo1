"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDesign = exports.updateDesign = exports.getDesign = exports.getDesigns = exports.saveDesign = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const designService_1 = require("../services/designService");
const saveDesign = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const { name, productId, variantId, designData, artworkIds, thumbnailUrl, notes } = req.body;
        if (!name || !productId || !designData) {
            throw new errorHandler_1.ApiError(400, 'Name, productId, and designData are required');
        }
        const design = await (0, designService_1.createDesign)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.saveDesign = saveDesign;
const getDesigns = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const designs = await (0, designService_1.getUserDesigns)(req.user.id);
        res.status(200).json({
            success: true,
            data: { designs }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDesigns = getDesigns;
const getDesign = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const { id } = req.params;
        const design = await (0, designService_1.getDesignById)(id, req.user.id);
        if (!design) {
            throw new errorHandler_1.ApiError(404, 'Design not found');
        }
        res.status(200).json({
            success: true,
            data: { design }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDesign = getDesign;
const updateDesign = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const { id } = req.params;
        const { name, variantId, designData, artworkIds, thumbnailUrl, notes } = req.body;
        const design = await (0, designService_1.updateDesignById)(id, req.user.id, {
            name,
            variantId,
            designData,
            artworkIds,
            thumbnailUrl,
            notes
        });
        if (!design) {
            throw new errorHandler_1.ApiError(404, 'Design not found');
        }
        res.status(200).json({
            success: true,
            data: { design }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDesign = updateDesign;
const deleteDesign = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.ApiError(401, 'Not authenticated');
        }
        const { id } = req.params;
        const deleted = await (0, designService_1.deleteDesignById)(id, req.user.id);
        if (!deleted) {
            throw new errorHandler_1.ApiError(404, 'Design not found');
        }
        res.status(200).json({
            success: true,
            data: { message: 'Design deleted successfully' }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDesign = deleteDesign;
//# sourceMappingURL=designController.js.map