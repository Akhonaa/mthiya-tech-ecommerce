const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // store in cents to avoid floating point issues
    category: { type: String, default: "general", index: true },
    imageUrl: { type: String, default: "" },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true }, // lets admin "remove" a product without deleting order history
  },
  { timestamps: true }
);

// Enables text search across name/description
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);