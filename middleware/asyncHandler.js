// Wraps an async route handler so any thrown error (or rejected promise)
// automatically gets passed to next(err) — no try/catch needed in each controller.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;