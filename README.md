# Mthiya Tech — E-Commerce & Repair Booking Platform

A full-stack portfolio project: a PC hardware and gaming accessories e-commerce store with JWT authentication, an admin panel, Paystack payment integration, and a built-in repair booking system.

## Features

**Storefront**

- Browse, search, and filter products by category
- Shopping cart tied to the logged-in user
- Checkout and payment via Paystack

**Accounts**

- Signup/login with JWT authentication
- Role-based access control (customer vs admin)

**Repairs**

- Customers can book a repair (device type, issue description, contact info)
- Customers can track the status of their own bookings

**Admin Panel**

- Add, update, and remove products (pricing, stock, categories)
- View and manage all repair bookings (update status: pending → in progress → completed)

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (via Mongoose)
- **Auth:** JSON Web Tokens (JWT), bcrypt for password hashing
- **Payments:** Paystack API
- **Frontend:** HTML, CSS, vanilla JavaScript (served statically by Express)

## Project Structure

```
mthiya-tech/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── bookingController.js
├── middleware/
│   ├── auth.js
│   ├── admin.js
│   ├── validate.js
│   ├── asyncHandler.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   ├── Order.js
│   └── Booking.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   └── bookings.js
├── public/                  # frontend
│   ├── index.html            # home / shop
│   ├── login.html
│   ├── cart.html
│   ├── checkout-success.html
│   ├── repairs.html          # repair booking form
│   ├── admin.html            # admin panel (products + bookings)
│   ├── css/style.css
│   └── js/
│       ├── api.js            # shared fetch/auth helper
│       ├── home.js
│       ├── auth.js
│       ├── cart.js
│       ├── checkout-success.js
│       ├── repairs.js
│       └── admin.js
├── .env.example
├── server.js
└── README.md
```

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Copy to `.env` and fill in your own values:

   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   PAYSTACK_SECRET_KEY=your_paystack_test_secret_key
   PORT=5000
   ```

3. Start the server:

   ```
   node server.js
   ```

4. Open `http://localhost:5000` in a browser.

## Authentication

Protected API routes require a JWT in the request header:

```
Authorisation: Bearer <token>
```

New accounts default to the `customer` role. Admin accounts are promoted manually via the database (no public "become admin" endpoint, by design).

## API Reference

### Auth

| Method | Endpoint           | Auth | Description           |
| ------ | ------------------ | ---- | --------------------- |
| POST   | `/api/auth/signup` | No   | Create an account     |
| POST   | `/api/auth/login`  | No   | Log in, receive a JWT |

### Products

| Method | Endpoint            | Auth  | Description                 |
| ------ | ------------------- | ----- | --------------------------- |
| GET    | `/api/products`     | No    | List/search/filter products |
| GET    | `/api/products/:id` | No    | Get a single product        |
| POST   | `/api/products`     | Admin | Create a product            |
| PUT    | `/api/products/:id` | Admin | Update a product            |
| DELETE | `/api/products/:id` | Admin | Soft-delete a product       |

### Cart

| Method | Endpoint                     | Auth | Description     |
| ------ | ---------------------------- | ---- | --------------- |
| GET    | `/api/cart`                  | Yes  | View cart       |
| POST   | `/api/cart/items`            | Yes  | Add item        |
| PUT    | `/api/cart/items/:productId` | Yes  | Update quantity |
| DELETE | `/api/cart/items/:productId` | Yes  | Remove item     |

### Orders

| Method | Endpoint                        | Auth | Description                                   |
| ------ | ------------------------------- | ---- | --------------------------------------------- |
| POST   | `/api/orders/checkout`          | Yes  | Start a Paystack payment for the current cart |
| GET    | `/api/orders/verify/:reference` | Yes  | Verify payment and finalize the order         |
| GET    | `/api/orders`                   | Yes  | View order history                            |

### Repair Bookings

| Method | Endpoint                   | Auth  | Description                 |
| ------ | -------------------------- | ----- | --------------------------- |
| POST   | `/api/bookings`            | Yes   | Submit a repair booking     |
| GET    | `/api/bookings`            | Yes   | View your own bookings      |
| GET    | `/api/bookings/all`        | Admin | View all bookings           |
| PUT    | `/api/bookings/:id/status` | Admin | Update booking status/notes |

## Design Decisions

- **Prices stored in cents** — avoids floating-point rounding errors common with decimal currency math.
- **Soft-delete for products** — deactivating rather than deleting preserves historical order data.
- **Order item snapshots** — each order stores product name/price _at the time of purchase_, so later price changes don't alter past orders.
- **Role-based admin access** — no public "become admin" route; a deliberate security boundary for this project's scope.

## Future Improvements

- Order history page on the storefront
- Webhook-based payment confirmation (in addition to manual verification)
- Automated tests (Jest/Supertest)
- Deploy to a live environment
