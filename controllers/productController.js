const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

const getProducts = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 20 } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const products = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(filter);

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, imageUrl, stock } = req.body;
  const product = await Product.create({ name, description, price, category, imageUrl, stock });
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product removed" });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };