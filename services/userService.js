const userRepository = require("../repositories/userRepository");
const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function signup({ name, email, password }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const error = new Error("An account with that email already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await userRepository.create({ name, email, password });
  const token = signToken(user);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = signToken(user);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
}

async function getAllUsers() {
  return userRepository.findAll();
}

async function createUser({ name, email, password, role = "customer" }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const error = new Error("A user with that email already exists");
    error.statusCode = 409;
    throw error;
  }
  const user = await userRepository.create({ name, email, password, role });
  const { password: _omit, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
}

async function updateUserRole(id, role, requestingUserId) {
  if (!["customer", "admin"].includes(role)) {
    const error = new Error("role must be 'customer' or 'admin'");
    error.statusCode = 400;
    throw error;
  }
  if (id === requestingUserId && role !== "admin") {
    const error = new Error("You cannot remove your own admin access");
    error.statusCode = 400;
    throw error;
  }
  const user = await userRepository.updateById(id, { role });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
}

async function updateUser(id, { name, email }) {
  if (email) {
    const existing = await userRepository.findByEmail(email);
    if (existing && existing._id.toString() !== id) {
      const error = new Error("That email is already in use by another account");
      error.statusCode = 409;
      throw error;
    }
  }
  const user = await userRepository.updateById(id, {
    ...(name && { name }),
    ...(email && { email: email.toLowerCase() }),
  });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
}

module.exports = { signup, login, getAllUsers, createUser, updateUserRole, updateUser };