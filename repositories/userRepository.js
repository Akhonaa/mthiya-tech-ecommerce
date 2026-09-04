const User = require("../models/User");

// "IUserRepository" — every function here is the
// agreed contract. If databases are changed, rewrite THIS file only;
// every function name below stays the same, so nothing else has to change.

async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

async function findById(id) {
  return User.findById(id);
}

async function findAll() {
  return User.find().select("-password").sort({ createdAt: -1 });
}

async function create(userData) {
  return User.create(userData);
}

async function updateById(id, updates) {
  return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select("-password");
}

module.exports = { findByEmail, findById, findAll, create, updateById };