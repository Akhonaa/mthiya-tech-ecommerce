const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }
  res.json(cart);
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (product.stock < quantity) {
    return res.status(400).json({ message: "Not enough stock available" });
  }

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate("items.product");
  res.status(201).json(cart);
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

const updateItemQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "quantity must be at least 1" });
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find((item) => item.product.toString() === req.params.productId);
  if (!item) return res.status(404).json({ message: "Item not in cart" });

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

module.exports = { getCart, addItem, removeItem, updateItemQuantity };