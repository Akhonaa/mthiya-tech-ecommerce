const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const { checkout, verifyPayment, getMyOrders } = require("../controllers/orderController");

router.use(requireAuth); // must be logged in to checkout or view orders

router.post("/checkout", checkout);
router.get("/verify/:reference", verifyPayment);
router.get("/", getMyOrders);

module.exports = router;