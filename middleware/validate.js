// A small reusable validator. You give it a list of rules; it checks the
// request body against them and responds with a 400 if anything fails.
//
// Example usage:
//   validate([
//     { field: "email", required: true, type: "email" },
//     { field: "price", required: true, type: "number", min: 0 },
//   ])

function validate(rules) {
  return (req, res, next) => {
    const errors = [];

    for (const rule of rules) {
      const value = req.body[rule.field];
      const isEmpty = value === undefined || value === null || value === "";

      if (rule.required && isEmpty) {
        errors.push(`${rule.field} is required`);
        continue;
      }
      if (isEmpty) continue; // optional field, nothing provided, skip further checks

      if (rule.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) errors.push(`${rule.field} must be a valid email`);
      }

      if (rule.type === "number") {
        if (typeof value !== "number") errors.push(`${rule.field} must be a number`);
        if (rule.min !== undefined && value < rule.min) errors.push(`${rule.field} must be at least ${rule.min}`);
      }

      if (rule.type === "string") {
        if (typeof value !== "string") errors.push(`${rule.field} must be text`);
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    next();
  };
}

module.exports = validate;