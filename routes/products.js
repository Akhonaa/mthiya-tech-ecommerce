const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const validate = require("../middleware/validate");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate([
    { field: "name", required: true, type: "string", minLength: 2 },
    { field: "price", required: true, type: "number", min: 0 },
    { field: "stock", type: "number", min: 0 },
  ]),
  createProduct
);

router.put("/:id", requireAuth, requireAdmin, updateProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

module.exports = router;