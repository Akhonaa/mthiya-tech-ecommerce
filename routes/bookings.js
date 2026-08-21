const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const validate = require("../middleware/validate");
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

router.use(requireAuth); // every booking route requires login

router.post(
  "/",
  validate([
    { field: "deviceType", required: true, type: "string", minLength: 2 },
    { field: "issueDescription", required: true, type: "string", minLength: 5 },
    { field: "contactPhone", required: true, type: "string", minLength: 6 },
  ]),
  createBooking
);

router.get("/", getMyBookings);
router.get("/all", requireAdmin, getAllBookings);
router.put("/:id/status", requireAdmin, updateBookingStatus);

module.exports = router;