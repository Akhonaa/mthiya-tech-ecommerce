const Order = require("../models/Order");

async function create(data) {
  return Order.create(data);
}

async function findByReference(reference) {
  return Order.findOne({ paystackReference: reference });
}

async function save(orderDoc) {
  return orderDoc.save();
}

async function findByUser(userId) {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
}

module.exports = { create, findByReference, save, findByUser };