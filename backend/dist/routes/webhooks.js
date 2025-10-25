"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhookController_1 = require("../controllers/webhookController");
const router = (0, express_1.Router)();
router.post('/production-update', webhookController_1.handleProductionUpdate);
router.post('/stripe', webhookController_1.handleStripeWebhook);
exports.default = router;
//# sourceMappingURL=webhooks.js.map