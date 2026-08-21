renderNavbar();

const user = getUser();
if (!user || user.role !== "admin") {
  document.getElementById("adminContent").innerHTML = `
    <div class="empty-state">
      <h2 style="margin-bottom: 0.5rem;">Admin access required</h2>
      <p>You don't have permission to view this page.</p>
    </div>
  `;
  throw new Error("Not admin");
}

const tableBody = document.getElementById("productTableBody");

function toRand(cents) {
  return (cents / 100).toFixed(2);
}
function toCents(rand) {
  return Math.round(Number(rand) * 100);
}

async function loadProducts() {
  try {
    // Admins should see inactive products too, so request a high limit and filter client-side isn't ideal —
    // for now this reuses the public endpoint, which only returns active products.
    const data = await apiFetch("/products?limit=100");
    renderTable(data.products);
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5">Failed to load: ${err.message}</td></tr>`;
  }
}

function renderTable(products) {
  if (products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5">No products yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = products
    .map(
      (p) => `
    <tr data-id="${p._id}">
      <td>${p.name}</td>
      <td><input type="number" step="0.01" class="edit-price" value="${toRand(p.price)}" /></td>
      <td><input type="number" class="edit-stock" value="${p.stock}" /></td>
      <td>${p.isActive ? "Active" : "Inactive"}</td>
      <td class="row-actions">
        <button class="save" data-action="save">Save</button>
        <button class="delete" data-action="delete">Remove</button>
      </td>
    </tr>
  `
    )
    .join("");

  tableBody.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => handleRowAction(btn));
  });
}

async function handleRowAction(btn) {
  const row = btn.closest("tr");
  const id = row.dataset.id;
  const action = btn.dataset.action;

  try {
    if (action === "save") {
      const price = toCents(row.querySelector(".edit-price").value);
      const stock = Number(row.querySelector(".edit-stock").value);
      await apiFetch(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({ price, stock }),
      });
      showToast("Product updated");
    } else if (action === "delete") {
      if (!confirm("Remove this product from the catalog?")) return;
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      showToast("Product removed");
      loadProducts();
    }
  } catch (err) {
    showToast(err.message);
  }
}

document.getElementById("addProductForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const body = {
      name: document.getElementById("newName").value,
      description: document.getElementById("newDescription").value,
      price: toCents(document.getElementById("newPrice").value),
      stock: Number(document.getElementById("newStock").value),
      category: document.getElementById("newCategory").value || "general",
      imageUrl: document.getElementById("newImageUrl").value,
    };
    await apiFetch("/products", { method: "POST", body: JSON.stringify(body) });
    showToast("Product added");
    e.target.reset();
    loadProducts();
  } catch (err) {
    showToast(err.message);
  }
});

loadProducts();

const bookingsTableBody = document.getElementById("bookingsTableBody");

function statusLabel(status) {
  return { pending: "Pending", in_progress: "In Progress", completed: "Completed" }[status] || status;
}

async function loadBookings() {
  try {
    const bookings = await apiFetch("/bookings/all");
    renderBookingsTable(bookings);
  } catch (err) {
    bookingsTableBody.innerHTML = `<tr><td colspan="6">Failed to load: ${err.message}</td></tr>`;
  }
}

function renderBookingsTable(bookings) {
  if (bookings.length === 0) {
    bookingsTableBody.innerHTML = `<tr><td colspan="6">No bookings yet.</td></tr>`;
    return;
  }

  bookingsTableBody.innerHTML = bookings
    .map(
      (b) => `
    <tr data-id="${b._id}">
      <td>${b.user?.name || "Unknown"}<br><span style="color: var(--text-muted); font-size: 0.78rem;">${b.user?.email || ""}</span></td>
      <td>${b.deviceType}</td>
      <td class="issue-cell">${b.issueDescription}</td>
      <td>${b.contactPhone}</td>
      <td>
        <select class="status-select">
          <option value="pending" ${b.status === "pending" ? "selected" : ""}>Pending</option>
          <option value="in_progress" ${b.status === "in_progress" ? "selected" : ""}>In Progress</option>
          <option value="completed" ${b.status === "completed" ? "selected" : ""}>Completed</option>
        </select>
      </td>
      <td>${new Date(b.createdAt).toLocaleDateString()}</td>
    </tr>
  `
    )
    .join("");

  bookingsTableBody.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async (e) => {
      const row = e.target.closest("tr");
      const id = row.dataset.id;
      try {
        await apiFetch(`/bookings/${id}/status`, {
          method: "PUT",
          body: JSON.stringify({ status: e.target.value }),
        });
        showToast("Booking status updated");
      } catch (err) {
        showToast(err.message);
      }
    });
  });
}

loadBookings();