renderNavbar();
renderFooter();

const grid = document.getElementById("productGrid");
const trendingRow = document.getElementById("trendingRow");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const gridTitle = document.getElementById("gridTitle");
const categoryListEl = document.getElementById("categoryList");

let activeCategory = "";

function formatPrice(cents) {
  return `R${(cents / 100).toFixed(2)}`;
}

function productCardHTML(p) {
  return `
    <div class="product-card">
      <div class="product-image">${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" />` : "No image"}</div>
      <span class="category">${p.category}</span>
      <h3>${p.name}</h3>
      <span class="stock ${p.stock < 5 ? "low" : ""}">${p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</span>
      <div class="price">${formatPrice(p.price)}</div>
      <button class="btn btn-primary" data-id="${p._id}" ${p.stock === 0 ? "disabled" : ""}>
        Add to Cart
      </button>
    </div>
  `;
}

function renderProducts(products) {
  if (products.length === 0) {
    grid.innerHTML = `<div class="empty-state">No products found.</div>`;
    return;
  }
  grid.innerHTML = products.map(productCardHTML).join("");
  attachAddToCartHandlers(grid);
}

function attachAddToCartHandlers(container) {
  container.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });
}

async function loadProducts(search = "", category = "") {
  grid.innerHTML = `<div class="empty-state">Loading...</div>`;
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await apiFetch(`/products${query}`);
    renderProducts(data.products);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Failed to load products: ${err.message}</div>`;
  }
}

async function loadTrending() {
  try {
    const data = await apiFetch("/products?limit=8");
    trendingRow.innerHTML = data.products
      .map(
        (p) => `
      <div class="trending-card" data-id="${p._id}">
        <div class="product-image">${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" />` : "No image"}</div>
        <h4>${p.name}</h4>
        <div class="price">${formatPrice(p.price)}</div>
      </div>
    `
      )
      .join("");

    trendingRow.querySelectorAll(".trending-card").forEach((card) => {
      card.addEventListener("click", () => addToCart(card.dataset.id));
    });
  } catch (err) {
    trendingRow.innerHTML = `<div class="empty-state">Could not load trending items.</div>`;
  }
}

async function addToCart(productId) {
  if (!getToken()) {
    showToast("Please log in first");
    setTimeout(() => (window.location.href = "/login.html"), 1000);
    return;
  }
  try {
    await apiFetch("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    showToast("Added to cart");
  } catch (err) {
    showToast(err.message);
  }
}

// Category sidebar clicks
categoryListEl.querySelectorAll("li").forEach((li) => {
  li.addEventListener("click", () => {
    categoryListEl.querySelectorAll("li").forEach((el) => el.classList.remove("active"));
    li.classList.add("active");
    activeCategory = li.dataset.category;
    gridTitle.textContent = li.querySelector("a").textContent;
    searchInput.value = "";
    loadProducts("", activeCategory);
    document.getElementById("browse").scrollIntoView({ behavior: "smooth" });
  });
});

searchBtn.addEventListener("click", () => loadProducts(searchInput.value, ""));
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadProducts(searchInput.value, "");
});

loadTrending();
loadProducts();