"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const designController_1 = require("../controllers/designController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All design routes require authentication
router.use(auth_1.authenticate);
router.post('/', designController_1.saveDesign);
router.get('/', designController_1.getDesigns);
router.get('/:id', designController_1.getDesign);
router.put('/:id', designController_1.updateDesign);
router.delete('/:id', designController_1.deleteDesign);
exports.default = router;
//# sourceMappingURL=designs.js.map