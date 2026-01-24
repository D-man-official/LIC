function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

// ===== Multiplier Logic =====
function onMultiplierChange(selectEl, baseAmount) {
  const multiplier = Number(selectEl.value);
  const card = selectEl.closest(".client-card");
  const amountInput = card.querySelector(".paid-amount");

  amountInput.value = baseAmount * multiplier;
}

// ===== Active Menu Highlight =====
const currentPage = window.location.pathname.split("/").pop();
const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach((item) => {
  const linkPage = item.getAttribute("href").split("/").pop();
  if (linkPage === currentPage) {
    item.classList.add("active");
  }
});

// ===== Main Daily Collection Logic =====
document.addEventListener("DOMContentLoaded", () => {
  const dateDisplay = document.getElementById("todayDate");
  const dateInput = document.getElementById("selectedDate");

  // Format date: 17 JAN 2026
  function formatDisplayDate(isoString) {
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).toUpperCase();
  }

  // Initialize date (always start with today if invalid)
  const todayISO = new Date().toISOString().split("T")[0];
  let activeDate = localStorage.getItem("activeDate");

  if (!activeDate || activeDate > todayISO) {
    activeDate = todayISO;
    localStorage.setItem("activeDate", activeDate);
  }

  dateInput.value = activeDate;
  dateDisplay.textContent = formatDisplayDate(activeDate);

  // Date change → save and reload
  dateInput.addEventListener("change", () => {
    if (dateInput.value) {
      localStorage.setItem("activeDate", dateInput.value);
      dateDisplay.textContent = formatDisplayDate(dateInput.value);
      location.reload();
    }
  });

  // Gentle live update for today's date only
  setInterval(() => {
    const currentActive = localStorage.getItem("activeDate");
    if (currentActive === todayISO) {
      dateDisplay.textContent = formatDisplayDate(todayISO);
    }
  }, 60000);

  // ────────────────────────────────────────────────────────
  //                DAILY COLLECTION CORE
  // ────────────────────────────────────────────────────────

  const pendingBody = document.getElementById("pendingBody");
  const collectedBody = document.getElementById("collectedBody");
  const collectedEmpty = document.getElementById("collectedEmpty");
  const pendingHeader = document.getElementById("pendingHeader");
  const collectedHeader = document.getElementById("collectedHeader");

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // e.g. "2026-01"

  let monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));

  // Auto-reset when month changes
  if (!monthlyData || monthlyData.month !== currentMonth) {
    localStorage.removeItem("monthlyClients");
    Object.keys(localStorage)
      .filter(k => k.startsWith("dailyStatus-"))
      .forEach(k => localStorage.removeItem(k));

    pendingBody.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">New month started — no clients yet</p>';
    collectedEmpty.style.display = "block";
    return;
  }

  const dailyKey = `dailyStatus-${activeDate}`;
  let dailyStatus = JSON.parse(localStorage.getItem(dailyKey)) || [];

  const pending = [];
  const collected = [];

  monthlyData.clients.forEach(client => {
    const statusEntry = dailyStatus.find(d => d.sl === client.sl);
    const status = statusEntry ? statusEntry.status : "pending";

    const record = {
      sl: client.sl,
      name: client.name,
      amount: statusEntry?.paidAmount ?? client.amount,
      status,
    };

    if (status === "pending") pending.push(record);
    else collected.push(record);
  });

  // Sort by serial number
  pending.sort((a, b) => a.sl - b.sl);
  collected.sort((a, b) => a.sl - b.sl);

  // Daily total collected
  const totalCollectedAmount = collected.reduce((sum, item) => sum + Number(item.amount), 0);

 
  localStorage.setItem("todayCollectionAmount", totalCollectedAmount);

  // Update headers
  pendingHeader.innerHTML = `<i class="fa-solid fa-clock" style="color:var(--orange)"></i> Pending (${pending.length})`;

  collectedHeader.innerHTML = `
    <i class="fa-solid fa-circle-check" style="color:var(--green)"></i>
    Collected (${collected.length}) • ₹${totalCollectedAmount}
  `;

  pendingBody.innerHTML = "";
  collectedBody.innerHTML = "";

  // ─── Pending Clients ──────────────────────────────────────
  pending.forEach(item => {
    const card = document.createElement("div");
    card.className = "client-card";

    card.innerHTML = `
      <div class="client-info">
        <h3>${item.name}</h3>
        <p>SL ${item.sl}</p>
      </div>

      <div style="display:flex; align-items:center; gap:8px;">
        <div class="payment-box">
          <select class="multiplier" onchange="onMultiplierChange(this, ${item.amount})">
            <option value="1">1×</option>
            <option value="2">2×</option>
            <option value="3">3×</option>
            <option value="4">4×</option>
            <option value="5">5×</option>
            <option value="6">6×</option>
          </select>

          <input type="number" class="paid-amount" value="${item.amount}" min="0" />

          <div class="button-group">
            <button class="mark-btn">Mark Paid</button>
            <button class="remove-btn">Remove</button>
          </div>
        </div>
      </div>
    `;

    // Mark as Paid
    card.querySelector(".mark-btn").addEventListener("click", () => {
      const paidAmount = Number(card.querySelector(".paid-amount").value);

      const paymentKey = `payment-${activeDate}`;
      let paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];

      paymentData = paymentData.filter(p => p.sl !== item.sl);
      paymentData.push({ sl: item.sl, amount: paidAmount });
      localStorage.setItem(paymentKey, JSON.stringify(paymentData));

      dailyStatus = dailyStatus.filter(d => d.sl !== item.sl);
      dailyStatus.push({
        sl: item.sl,
        status: "collected",
        paidAmount
      });

      localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));
      location.reload();
    });

    // Remove from monthly list
    card.querySelector(".remove-btn").addEventListener("click", () => {
      if (!confirm(`Remove ${item.name} from this month's list?`)) return;

      monthlyData.clients = monthlyData.clients.filter(c => c.sl !== item.sl);
      localStorage.setItem("monthlyClients", JSON.stringify(monthlyData));

      dailyStatus = dailyStatus.filter(d => d.sl !== item.sl);
      localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));

      location.reload();
    });

    pendingBody.appendChild(card);
  });

  // ─── Collected Section ────────────────────────────────────
  if (collected.length === 0) {
    collectedEmpty.style.display = "block";
  } else {
    collectedEmpty.style.display = "none";

    collected.forEach(item => {
      const card = document.createElement("div");
      card.className = "client-card";

      card.innerHTML = `
        <div class="client-info">
          <h3>${item.name}</h3>
          <p>SL ${item.sl}</p>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="amount">₹${item.amount}</div>
          <button class="undo-btn">Undo</button>
        </div>
      `;

      card.querySelector(".undo-btn").addEventListener("click", () => {
        dailyStatus = dailyStatus.filter(d => d.sl !== item.sl);
        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));

        const paymentKey = `payment-${activeDate}`;
        let paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];
        paymentData = paymentData.filter(p => p.sl !== item.sl);
        localStorage.setItem(paymentKey, JSON.stringify(paymentData));

        location.reload();
      });

      collectedBody.appendChild(card);
    });
  }
});


