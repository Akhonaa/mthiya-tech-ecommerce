renderNavbar();
renderFooter();
if (!getToken()) {
  window.location.href = "/login.html";
}

const cartItemsEl = document.getElementById("cartItems");
const cartSummaryEl = document.getElementById("cartSummary");

function formatPrice(cents) {
  return `R${(cents / 100).toFixed(2)}`;
}

async function loadCart() {
  try {
    const cart = await apiFetch("/cart");
    renderCart(cart);
  } catch (err) {
    cartItemsEl.innerHTML = `<div class="empty-state">Failed to load cart: ${err.message}</div>`;
  }
}

function renderCart(cart) {
  if (!cart.items || cart.items.length === 0) {
    cartItemsEl.innerHTML = `<div class="empty-state">Your cart is empty. <a href="/index.html" style="color: var(--accent-secondary)">Go shopping</a></div>`;
    cartSummaryEl.innerHTML = "";
    return;
  }

  let total = 0;

  cartItemsEl.innerHTML = cart.items
    .map((item) => {
      const product = item.product;
      const lineTotal = product.price * item.quantity;
      total += lineTotal;

      return `
      <div class="cart-item">
        <div class="thumb">${product.imageUrl ? `<img src="${product.imageUrl}" />` : "No image"}</div>
        <div class="info">
          <h4>${product.name}</h4>
          <div class="unit-price">${formatPrice(product.price)} each</div>
        </div>
        <div class="qty-controls">
          <button data-action="dec" data-id="${product._id}" data-qty="${item.quantity}">−</button>
          <span>${item.quantity}</span>
          <button data-action="inc" data-id="${product._id}" data-qty="${item.quantity}">+</button>
        </div>
        <div class="line-total">${formatPrice(lineTotal)}</div>
        <button class="remove-btn" data-action="remove" data-id="${product._id}">Remove</button>
      </div>
    `;
    })
    .join("");

  cartSummaryEl.innerHTML = `
    <div class="cart-summary">
      <span class="total">Total: ${formatPrice(total)}</span>
      <button class="btn btn-primary" id="checkoutBtn">Checkout</button>
    </div>
  `;

  document.getElementById("checkoutBtn").addEventListener("click", checkout);

  cartItemsEl.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => handleAction(btn));
  });
}

async function handleAction(btn) {
  const { action, id, qty } = btn.dataset;
  try {
    if (action === "remove") {
      await apiFetch(`/cart/items/${id}`, { method: "DELETE" });
    } else {
      const newQty = action === "inc" ? Number(qty) + 1 : Number(qty) - 1;
      if (newQty < 1) {
        await apiFetch(`/cart/items/${id}`, { method: "DELETE" });
      } else {
        await apiFetch(`/cart/items/${id}`, {
          method: "PUT",
          body: JSON.stringify({ quantity: newQty }),
        });
      }
    }
    loadCart();
  } catch (err) {
    showToast(err.message);
  }
}

async function checkout() {
  try {
    const data = await apiFetch("/orders/checkout", { method: "POST" });
    window.location.href = data.authorizationUrl; // redirect to Paystack's hosted page
  } catch (err) {
    showToast(err.message);
  }
}

loadCart();