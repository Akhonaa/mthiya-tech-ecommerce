const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

// Wraps fetch: adds JSON headers + auth token automatically, throws on non-2xx.
async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Renders the shared navbar into any element with id="navbar"
function renderNavbar() {
  const el = document.getElementById("navbar");
  if (!el) return;
  const user = getUser();

  el.innerHTML = `
    <div class="logo">Mthiya Tech</div>
    <div class="nav-links">
      <a href="/index.html">Shop</a>
      <a href="/cart.html">Cart</a>
      ${user?.role === "admin" ? `<a href="/admin.html">Admin Dashboard</a>` : ""}
      ${user
        ? `<span>Hi, ${user.name.split(" ")[0]}</span><button id="logoutBtn">Log out</button>`
        : `<a href="/login.html">Log in</a>`}
    </div>
  `;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      window.location.href = "/login.html";
    });
  }
}

function renderFooter() {
  const el = document.getElementById("footer");
  if (!el) return;

  el.innerHTML = `
    <div class="trust-bar">
      <div class="trust-bar-inner">
        <div class="trust-item">
          <span class="icon">🚚</span>
          <div><h4>Fast Local Shipping</h4><p>Orders dispatched quickly, no long import waits.</p></div>
        </div>
        <div class="trust-item">
          <span class="icon">🔒</span>
          <div><h4>Secure Payments</h4><p>Checkout powered by Paystack's trusted gateway.</p></div>
        </div>
        <div class="trust-item">
          <span class="icon">🛠️</span>
          <div><h4>Expert Repairs</h4><p>PC and gaming hardware repairs, done right.</p></div>
        </div>
        <div class="trust-item">
          <span class="icon">📦</span>
          <div><h4>Local Stock</h4><p>Kept in South Africa — no long international waits.</p></div>
        </div>
      </div>
    </div>

    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <h4>Contact Us</h4>
          <p>Mthiya Tech<br />An online store based in Ballito, KZN — shipping nationwide.</p>
          <a href="mailto:hello@mthiyatech.co.za">Email: hello@mthiyatech.co.za</a>
        </div>
        <div>
          <h4>Our Company</h4>
          <a href="/index.html">Shop</a>
          <a href="/repairs.html">Book a Repair</a>
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Shipping Info</a>
        </div>
        <div>
          <h4>Products</h4>
          <a href="/index.html">All Products</a>
          <a href="/repairs.html">Repairs &amp; Upgrades</a>
        </div>
      </div>
      <div class="footer-bottom">
        &copy; ${new Date().getFullYear()} Mthiya Tech. All rights reserved.
      </div>
    </footer>

    <button class="back-to-top" id="backToTopBtn">↑</button>
  `;

  const backToTopBtn = document.getElementById("backToTopBtn");
  window.addEventListener("scroll", () => {
    backToTopBtn.classList.toggle("show", window.scrollY > 400);
  });
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}