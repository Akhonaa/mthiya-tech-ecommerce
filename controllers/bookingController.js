const bookingService = require("../services/bookingService");
const asyncHandler = require("../middleware/asyncHandler");

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body);
  res.status(201).json(booking);
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getMyBookings(req.user.id);
  res.json(bookings);
});

const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getAllBookings();
  res.json(bookings);
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(req.params.id, req.body);
  res.json(booking);
});

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };