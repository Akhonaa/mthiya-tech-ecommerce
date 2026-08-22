const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
//const bcrypt = require("bcryptjs");


// GET /api/users — admin only, list all users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// PUT /api/users/:id/role — admin only, promote/demote a user
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["customer", "admin"].includes(role)) {
    return res.status(400).json({ message: "role must be 'customer' or 'admin'" });
  }

  // Prevent an admin from accidentally demoting themselves and getting locked out
  if (req.params.id === req.user.id && role !== "admin") {
    return res.status(400).json({ message: "You cannot remove your own admin access" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

// POST /api/users — admin only, create a new user with any role
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = "customer" } = req.body;

  if (!["customer", "admin"].includes(role)) {
    return res.status(400).json({ message: "role must be 'customer' or 'admin'" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "A user with that email already exists" });
  }

  const user = await User.create({ name, email, password, role });
  const { password: _omit, ...userWithoutPassword } = user.toObject();

  res.status(201).json(userWithoutPassword);
});

// PUT /api/users/:id — admin only, edit name/email
const updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (email) {
    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(409).json({ message: "That email is already in use by another account" });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(name && { name }), ...(email && { email: email.toLowerCase() }) },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});
module.exports = { getUsers, updateUserRole, createUser, updateUser };