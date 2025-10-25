"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const errorHandler_1 = require("./errorHandler");
const notFound = (req, _res, next) => {
    const error = new errorHandler_1.ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map