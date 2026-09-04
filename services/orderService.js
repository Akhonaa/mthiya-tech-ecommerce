const orderRepository = require("../repositories/orderRepository");
const cartRepository = require("../repositories/cartRepository");
const productRepository = require("../repositories/productRepository");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

async function checkout(userId, userEmail) {
  const cart = await cartRepository.findByUserPopulated(userId);

  if (!cart || cart.items.length === 0) {
    const error = new Error("Your cart is empty");
    error.statusCode = 400;
    throw error;
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await orderRepository.create({
    user: userId,
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
      email: userEmail || "customer@example.com",
      amount: totalAmount,
      reference: order._id.toString(),
      callback_url: "http://localhost:5000/checkout-success.html",
    }),
  });

  const data = await response.json();

  if (!data.status) {
    const error = new Error(data.message || "Failed to start payment");
    error.statusCode = 502;
    throw error;
  }

  order.paystackReference = data.data.reference;
  await orderRepository.save(order);

  return { orderId: order._id, authorizationUrl: data.data.authorization_url };
}

async function verifyPayment(reference) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const data = await response.json();

  const order = await orderRepository.findByReference(reference);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.status && data.data.status === "success") {
    order.status = "paid";
    await orderRepository.save(order);

    for (const item of order.items) {
      await productRepository.updateById(item.product, { $inc: { stock: -item.quantity } });
    }

    const cart = await cartRepository.findByUser(order.user);
    if (cart) {
      cart.items = [];
      await cartRepository.save(cart);
    }

    return { success: true, order };
  }

  order.status = "failed";
  await orderRepository.save(order);
  return { success: false, order };
}

async function getMyOrders(userId) {
  return orderRepository.findByUser(userId);
}

module.exports = { checkout, verifyPayment, getMyOrders };