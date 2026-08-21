// Catches any error passed to next(err), or thrown inside an async route,
// and sends a consistent JSON response instead of a raw crash/HTML page.
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Mongoose validation errors get a friendlier 400 instead of a generic 500
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: "Validation failed", errors: messages });
  }

  // Invalid MongoDB ObjectId (e.g. a malformed :id in the URL)
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Duplicate key error (e.g. signing up with an email that already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already in use` });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || "Something went wrong" });
}

// Runs when no route matched the request at all
function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };