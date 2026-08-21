const Booking = require("../models/Booking");
const asyncHandler = require("../middleware/asyncHandler");

// POST /api/bookings — logged-in customer creates a repair booking
const createBooking = asyncHandler(async (req, res) => {
  const { deviceType, issueDescription, contactPhone } = req.body;

  const booking = await Booking.create({
    user: req.user.id,
    deviceType,
    issueDescription,
    contactPhone,
  });

  res.status(201).json(booking);
});

// GET /api/bookings — logged-in customer's own bookings
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(bookings);
});

// GET /api/bookings/all — admin only, every booking across all customers
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(bookings);
});

// PUT /api/bookings/:id/status — admin only, update status/notes
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { ...(status && { status }), ...(adminNotes !== undefined && { adminNotes }) },
    { new: true, runValidators: true }
  );

  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
});

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };