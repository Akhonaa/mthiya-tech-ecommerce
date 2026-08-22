renderNavbar();
renderFooter();

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

let allProducts = [];

async function loadProducts() {
  try {
    // this reuses the public endpoint, which only returns active products.
    const data = await apiFetch("/products?limit=100");
    allProducts = data.products;
    renderTable(allProducts);
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
        <button data-action="edit">Edit</button>
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

  if (action === "edit") {
    const product = allProducts.find((p) => p._id === id);
    if (!product) return;
    document.getElementById("editProductId").value = product._id;
    document.getElementById("editProductName").value = product.name;
    document.getElementById("editProductDescription").value = product.description || "";
    document.getElementById("editProductCategory").value = product.category;
    document.getElementById("editProductImageUrl").value = product.imageUrl || "";
    document.getElementById("editProductModal").classList.add("show");
    return;
  }

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

const usersTableBody = document.getElementById("usersTableBody");
let allUsers = [];


async function loadUsers() {
  try {
    const users = await apiFetch("/users");
    allUsers = users;
    renderUsersTable(allUsers);
  } catch (err) {
    usersTableBody.innerHTML = `<tr><td colspan="5">Failed to load: ${err.message}</td></tr>`;
  }
}

function renderUsersTable(users) {
  if (users.length === 0) {
    usersTableBody.innerHTML = `<tr><td colspan="5">No users yet.</td></tr>`;
    return;
  }

  usersTableBody.innerHTML = users
    .map(
      (u) => `
    <tr data-id="${u._id}">
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.role === "admin" ? "Admin" : "Customer"}</td>
      <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td class="row-actions">
        <button data-action="edit-user">Edit</button>
        ${
          u.role === "admin"
            ? `<button class="delete" data-action="demote">Remove Admin</button>`
            : `<button class="save" data-action="promote">Make Admin</button>`
        }
      </td>
    </tr>
  `
    )
    .join("");

  usersTableBody.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => handleRoleChange(btn));
  });
}

async function handleRoleChange(btn) {
  const row = btn.closest("tr");
  const id = row.dataset.id;

  if (btn.dataset.action === "edit-user") {
    const user = allUsers.find((u) => u._id === id);
    if (!user) return;
    document.getElementById("editUserId").value = user._id;
    document.getElementById("editUserName").value = user.name;
    document.getElementById("editUserEmail").value = user.email;
    document.getElementById("editUserModal").classList.add("show");
    return;
  }
  const newRole = btn.dataset.action === "promote" ? "admin" : "customer";
  const confirmMsg =
    newRole === "admin" ? "Grant this user admin access?" : "Remove admin access from this user?";

  if (!confirm(confirmMsg)) return;

  try {
    await apiFetch(`/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role: newRole }),
    });
    showToast("User role updated");
    loadUsers();
  } catch (err) {
    showToast(err.message);
  }
}
document.getElementById("createUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const body = {
      name: document.getElementById("newUserName").value,
      email: document.getElementById("newUserEmail").value,
      password: document.getElementById("newUserPassword").value,
      role: document.getElementById("newUserRole").value,
    };
    await apiFetch("/users", { method: "POST", body: JSON.stringify(body) });
    showToast("User created");
    e.target.reset();
    loadUsers();
  } catch (err) {
    showToast(err.message);
  }
});
document.getElementById("productSearchInput").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allProducts.filter(
    (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
  );
  renderTable(filtered);
});

document.getElementById("userSearchInput").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allUsers.filter(
    (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
  );
  renderUsersTable(filtered);
});
// Product edit modal wiring
document.getElementById("cancelProductEdit").addEventListener("click", () => {
  document.getElementById("editProductModal").classList.remove("show");
});

document.getElementById("editProductForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editProductId").value;
  try {
    await apiFetch(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: document.getElementById("editProductName").value,
        description: document.getElementById("editProductDescription").value,
        category: document.getElementById("editProductCategory").value,
        imageUrl: document.getElementById("editProductImageUrl").value,
      }),
    });
    showToast("Product updated");
    document.getElementById("editProductModal").classList.remove("show");
    loadProducts();
  } catch (err) {
    showToast(err.message);
  }
});

// User edit modal wiring
document.getElementById("cancelUserEdit").addEventListener("click", () => {
  document.getElementById("editUserModal").classList.remove("show");
});

document.getElementById("editUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editUserId").value;
  try {
    await apiFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: document.getElementById("editUserName").value,
        email: document.getElementById("editUserEmail").value,
      }),
    });
    showToast("User updated");
    document.getElementById("editUserModal").classList.remove("show");
    loadUsers();
  } catch (err) {
    showToast(err.message);
  }
});
loadUsers();