const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const validate = require("../middleware/validate");
const { getUsers, updateUserRole, createUser, updateUser  } = require("../controllers/userController");

router.use(requireAuth, requireAdmin);

router.get("/", getUsers);
router.post(
  "/",
  validate([
    { field: "name", required: true, type: "string", minLength: 2 },
    { field: "email", required: true, type: "email" },
    { field: "password", required: true, type: "string", minLength: 6 },
  ]),
  createUser
);
router.put("/:id/role", updateUserRole);
router.put("/:id", updateUser);

module.exports = router;