const productRepository = require("../repositories/productRepository");

async function getProducts({ search, category, page = 1, limit = 20 }) {
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const products = await productRepository.find(filter, {
    skip: (page - 1) * limit,
    limit: Number(limit),
    sort: { createdAt: -1 },
  });
  const total = await productRepository.count(filter);

  return { products, total, page: Number(page), pages: Math.ceil(total / limit) };
}

async function getProductById(id) {
  const product = await productRepository.findById(id);
  if (!product || !product.isActive) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  return product;
}

async function createProduct(data) {
  const { name, description, price, category, imageUrl, stock } = data;
  return productRepository.create({ name, description, price, category, imageUrl, stock });
}

async function updateProduct(id, updates) {
  const product = await productRepository.updateById(id, updates);
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  return product;
}

async function deleteProduct(id) {
  const product = await productRepository.updateById(id, { isActive: false });
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  return { message: "Product removed" };
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };