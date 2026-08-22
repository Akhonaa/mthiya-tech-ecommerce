renderNavbar();
renderFooter();

const wrapper = document.getElementById("statusWrapper");

function formatPrice(cents) {
  return `R${(cents / 100).toFixed(2)}`;
}

async function verifyOrder() {
  const params = new URLSearchParams(window.location.search);
  const reference = params.get("reference") || params.get("trxref");

  if (!reference) {
    wrapper.innerHTML = `
      <div class="status-icon">⚠️</div>
      <h1>No payment reference found</h1>
      <p>If you completed a payment, check your order history to confirm.</p>
      <a href="/index.html" class="btn btn-primary">Back to Shop</a>
    `;
    return;
  }

  try {
    const data = await apiFetch(`/orders/verify/${reference}`);
    const order = data.order;

    wrapper.innerHTML = `
      <div class="status-icon">✅</div>
      <h1>Payment successful!</h1>
      <p>Thank you for your order.</p>
      <div class="order-summary">
        ${order.items
          .map(
            (item) => `<div><span>${item.name} × ${item.quantity}</span><span>${formatPrice(item.price * item.quantity)}</span></div>`
          )
          .join("")}
        <div style="border-top: 1px solid var(--border); margin-top: 0.5rem; padding-top: 0.5rem; font-weight: 700;">
          <span>Total</span><span>${formatPrice(order.totalAmount)}</span>
        </div>
      </div>
      <a href="/index.html" class="btn btn-primary">Continue Shopping</a>
    `;
  } catch (err) {
    wrapper.innerHTML = `
      <div class="status-icon">❌</div>
      <h1>Payment verification failed</h1>
      <p>${err.message}</p>
      <a href="/cart.html" class="btn btn-secondary">Back to Cart</a>
    `;
  }
}

verifyOrder();