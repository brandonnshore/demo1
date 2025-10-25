"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('admin'));
// Product management
router.post('/products', adminController_1.createProduct);
router.put('/products/:id', adminController_1.updateProduct);
router.delete('/products/:id', adminController_1.deleteProduct);
// Order management
router.get('/orders', adminController_1.getAllOrders);
router.patch('/orders/:id/status', adminController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=admin.js.map