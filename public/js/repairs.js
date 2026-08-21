renderNavbar();

if (!getToken()) {
  showToast("Please log in to book a repair");
  setTimeout(() => (window.location.href = "/login.html"), 1000);
}

const bookingsList = document.getElementById("bookingsList");

function statusLabel(status) {
  return { pending: "Pending", in_progress: "In Progress", completed: "Completed" }[status] || status;
}

async function loadBookings() {
  try {
    const bookings = await apiFetch("/bookings");
    if (bookings.length === 0) {
      bookingsList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No bookings yet.</p>`;
      return;
    }
    bookingsList.innerHTML = bookings
      .map(
        (b) => `
      <div class="booking-item">
        <div class="device">${b.deviceType}</div>
        <div class="issue">${b.issueDescription}</div>
        <span class="status-badge status-${b.status}">${statusLabel(b.status)}</span>
        <div class="meta">Submitted ${new Date(b.createdAt).toLocaleDateString()}</div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    bookingsList.innerHTML = `<p style="color: var(--danger);">${err.message}</p>`;
  }
}

document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const body = {
      deviceType: document.getElementById("deviceType").value,
      contactPhone: document.getElementById("contactPhone").value,
      issueDescription: document.getElementById("issueDescription").value,
    };
    await apiFetch("/bookings", { method: "POST", body: JSON.stringify(body) });
    showToast("Booking submitted");
    e.target.reset();
    loadBookings();
  } catch (err) {
    showToast(err.message);
  }
});

loadBookings();