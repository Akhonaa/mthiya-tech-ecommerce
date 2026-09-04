const userService = require("../services/userService");
const asyncHandler = require("../middleware/asyncHandler");

const signup = asyncHandler(async (req, res) => {
  const result = await userService.signup(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await userService.login(req.body);
  res.json(result);
});

module.exports = { signup, login };