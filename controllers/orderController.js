const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const checkout = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalAmount,
    status: "pending",
  });

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: req.user.email || "customer@example.com",
      amount: totalAmount,
      reference: order._id.toString(),
      callback_url: "http://localhost:5000/checkout-success.html",
    }),
  });

  const data = await response.json();

  if (!data.status) {
    return res.status(502).json({ message: "Failed to start payment", error: data.message });
  }

  order.paystackReference = data.data.reference;
  await order.save();

  res.status(201).json({
    orderId: order._id,
    authorizationUrl: data.data.authorization_url,
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const data = await response.json();

  const order = await Order.findOne({ paystackReference: reference });
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (data.status && data.data.status === "success") {
    order.status = "paid";
    await order.save();
        //reduce stock for each purchased item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

    return res.json({ message: "Payment verified", order });
  }

  order.status = "failed";
  await order.save();
  res.status(400).json({ message: "Payment not successful", order });
});
//logged in user's order history
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = { checkout, verifyPayment, getMyOrders };