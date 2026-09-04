const cartRepository = require("../repositories/cartRepository");
const productRepository = require("../repositories/productRepository");

async function getCart(userId) {
  let cart = await cartRepository.findByUserPopulated(userId);
  if (!cart) {
    cart = await cartRepository.create(userId);
    await cart.populate("items.product");
  }
  return cart;
}

async function addItem(userId, productId, quantity = 1) {
  const product = await productRepository.findById(productId);
  if (!product || !product.isActive) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  if (product.stock < quantity) {
    const error = new Error("Not enough stock available");
    error.statusCode = 400;
    throw error;
  }

  let cart = await cartRepository.findByUser(userId);
  if (!cart) cart = await cartRepository.create(userId);

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cartRepository.save(cart);
  await cart.populate("items.product");
  return cart;
}

async function removeItem(userId, productId) {
  const cart = await cartRepository.findByUser(userId);
  if (!cart) {
    const error = new Error("Cart not found");
    error.statusCode = 404;
    throw error;
  }
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cartRepository.save(cart);
  await cart.populate("items.product");
  return cart;
}

async function updateItemQuantity(userId, productId, quantity) {
  if (!quantity || quantity < 1) {
    const error = new Error("quantity must be at least 1");
    error.statusCode = 400;
    throw error;
  }
  const cart = await cartRepository.findByUser(userId);
  if (!cart) {
    const error = new Error("Cart not found");
    error.statusCode = 404;
    throw error;
  }
  const item = cart.items.find((item) => item.product.toString() === productId);
  if (!item) {
    const error = new Error("Item not in cart");
    error.statusCode = 404;
    throw error;
  }
  item.quantity = quantity;
  await cartRepository.save(cart);
  await cart.populate("items.product");
  return cart;
}

module.exports = { getCart, addItem, removeItem, updateItemQuantity };