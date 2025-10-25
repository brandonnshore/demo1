"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const priceController_1 = require("../controllers/priceController");
const router = (0, express_1.Router)();
router.post('/quote', priceController_1.calculateQuote);
exports.default = router;
//# sourceMappingURL=pricing.js.map