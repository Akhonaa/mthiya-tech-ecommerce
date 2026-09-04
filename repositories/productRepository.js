const Product = require("../models/Product");

async function find(filter, { skip, limit, sort } = {}) {
  let query = Product.find(filter);
  if (sort) query = query.sort(sort);
  if (skip !== undefined) query = query.skip(skip);
  if (limit !== undefined) query = query.limit(limit);
  return query;
}

async function count(filter) {
  return Product.countDocuments(filter);
}

async function findById(id) {
  return Product.findById(id);
}

async function create(data) {
  return Product.create(data);
}

async function updateById(id, updates) {
  return Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

module.exports = { find, count, findById, create, updateById };