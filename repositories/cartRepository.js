const Cart = require("../models/Cart");

async function findByUser(userId) {
  return Cart.findOne({ user: userId });
}

async function findByUserPopulated(userId) {
  return Cart.findOne({ user: userId }).populate("items.product");
}

async function create(userId) {
  return Cart.create({ user: userId, items: [] });
}

async function save(cartDoc) {
  return cartDoc.save();
}

module.exports = { findByUser, findByUserPopulated, create, save };