"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateQuote = void 0;
const priceService_1 = require("../services/priceService");
const errorHandler_1 = require("../middleware/errorHandler");
const calculateQuote = async (req, res, next) => {
    try {
        const { variant_id, method, placements, quantity } = req.body;
        if (!variant_id || !method || !placements || !quantity) {
            throw new errorHandler_1.ApiError(400, 'variant_id, method, placements, and quantity are required');
        }
        const quote = await (0, priceService_1.calculatePrice)(variant_id, method, placements, quantity);
        res.status(200).json({
            success: true,
            data: quote
        });
    }
    catch (error) {
        next(error);
    }
};
exports.calculateQuote = calculateQuote;
//# sourceMappingURL=priceController.js.map