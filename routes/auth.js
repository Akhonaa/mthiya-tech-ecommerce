const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { signup, login } = require("../controllers/authController");

router.post(
  "/signup",
  validate([
    { field: "name", required: true, type: "string", minLength: 2 },
    { field: "email", required: true, type: "email" },
    { field: "password", required: true, type: "string", minLength: 6 },
  ]),
  signup
);

router.post(
  "/login",
  validate([
    { field: "email", required: true, type: "email" },
    { field: "password", required: true },
  ]),
  login
);

module.exports = router;