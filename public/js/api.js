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