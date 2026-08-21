const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { getCart, addItem, removeItem, updateItemQuantity } = require("../controllers/cartController");

router.use(requireAuth);

router.get("/", getCart);
router.post(
  "/items",
  validate([{ field: "productId", required: true, type: "string" }]),
  addItem
);
router.put("/items/:productId", updateItemQuantity);
router.delete("/items/:productId", removeItem);

module.exports = router;