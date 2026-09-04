const bookingRepository = require("../repositories/bookingRepository");

async function createBooking(userId, { deviceType, issueDescription, contactPhone }) {
  return bookingRepository.create({ user: userId, deviceType, issueDescription, contactPhone });
}

async function getMyBookings(userId) {
  return bookingRepository.findByUser(userId);
}

async function getAllBookings() {
  return bookingRepository.findAll();
}

async function updateBookingStatus(id, { status, adminNotes }) {
  const booking = await bookingRepository.updateById(id, {
    ...(status && { status }),
    ...(adminNotes !== undefined && { adminNotes }),
  });
  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }
  return booking;
}

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };