"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const router = (0, express_1.Router)();
router.post('/signed-url', uploadController_1.getSignedUrl);
router.post('/file', uploadController_1.uploadMiddleware, uploadController_1.uploadFile);
exports.default = router;
//# sourceMappingURL=uploads.js.map