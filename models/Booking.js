const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deviceType: { type: String, required: true, trim: true }, // e.g. "PC", "PS5 Controller", "Gaming Laptop"
    issueDescription: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    adminNotes: { type: String, default: "" }, // internal notes, e.g. quote or diagnosis
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);