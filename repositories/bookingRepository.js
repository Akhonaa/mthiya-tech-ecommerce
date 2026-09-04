const Booking = require("../models/Booking");

async function create(data) {
  return Booking.create(data);
}

async function findByUser(userId) {
  return Booking.find({ user: userId }).sort({ createdAt: -1 });
}

async function findAll() {
  return Booking.find().populate("user", "name email").sort({ createdAt: -1 });
}

async function updateById(id, updates) {
  return Booking.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

module.exports = { create, findByUser, findAll, updateById };