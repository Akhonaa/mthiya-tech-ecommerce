const orderService = require("../services/orderService");
const asyncHandler = require("../middleware/asyncHandler");

const checkout = asyncHandler(async (req, res) => {
  const result = await orderService.checkout(req.user.id, req.user.email);
  res.status(201).json(result);
});

const verifyPayment = asyncHandler(async (req, res) => {
  const result = await orderService.verifyPayment(req.params.reference);
  if (result.success) {
    return res.json({ message: "Payment verified", order: result.order });
  }
  res.status(400).json({ message: "Payment not successful", order: result.order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user.id);
  res.json(orders);
});

module.exports = { checkout, verifyPayment, getMyOrders };