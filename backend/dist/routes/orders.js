"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
router.post('/create', orderController_1.createOrder);
router.post('/:id/capture-payment', orderController_1.capturePayment);
router.get('/:id', orderController_1.getOrder);
exports.default = router;
//# sourceMappingURL=orders.js.map