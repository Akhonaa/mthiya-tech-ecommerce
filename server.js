require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const bookingRoutes = require("./routes/bookings");
const userRoutes = require("./routes/users");






const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json()); // lets Express parse JSON request bodies

/*app.get("/", (req, res) => {
  res.send("E-commerce API is running");
});*/
app.use(express.static("public"));
app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);      // catches unmatched routes
app.use(errorHandler);  // catches everything passed to next(err)






app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});