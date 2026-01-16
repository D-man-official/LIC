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

const currentPage = window.location.pathname.split("/").pop();
const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach((item) => {
  const linkPage = item.getAttribute("href").split("/").pop();

  if (linkPage === currentPage) {
    item.classList.add("active");
  }
});

// ===== Today Date Module =====
function updateDate() {
  const today = new Date();

  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  const formattedDate = today
    .toLocaleDateString("en-GB", options)
    .toUpperCase();

  const dateEl = document.getElementById("todayDate");

  if (dateEl) {
    dateEl.textContent = formattedDate;
  }
}

// Wait until HTML is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  updateDate();
  setInterval(updateDate, 60000);
});

// ===== Daily Collection Module =====
document.addEventListener("DOMContentLoaded", () => {
  updateDate();

  const pendingBody = document.getElementById("pendingBody");
  const collectedBody = document.getElementById("collectedBody");
  const collectedEmpty = document.getElementById("collectedEmpty");

  const pendingHeader = document.getElementById("pendingHeader");
  const collectedHeader = document.getElementById("collectedHeader");

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentMonth = now.toISOString().slice(0, 7);

  const monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));

  if (!monthlyData || monthlyData.month !== currentMonth) {
    // Month ended → everything resets automatically
    localStorage.removeItem("monthlyClients");
    Object.keys(localStorage)
      .filter((k) => k.startsWith("dailyStatus-"))
      .forEach((k) => localStorage.removeItem(k));
    return;
  }

  const dailyKey = `dailyStatus-${today}`;

  let dailyStatus = JSON.parse(localStorage.getItem(dailyKey)) || [];

  // _______________________________________________________________

  const pending = [];
  const collected = [];

  monthlyData.clients.forEach((client) => {
    const statusEntry = dailyStatus.find((d) => d.sl === client.sl);
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

  // sort both by SL
  pending.sort((a, b) => a.sl - b.sl);
  collected.sort((a, b) => a.sl - b.sl);

  // _______________________________________________________________

  pendingHeader.innerHTML = `<i class="fa-solid fa-clock" style="color:var(--orange)"></i>
    Pending (${pending.length})`;

  collectedHeader.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--green)"></i>
    Collected (${collected.length})`;

  pendingBody.innerHTML = "";
  collectedBody.innerHTML = "";

  pending.forEach((item) => {
    const card = document.createElement("div");
    card.className = "client-card";

    card.innerHTML = `
      <div class="client-info">
        <h3>${item.name}</h3>
        <p>SL ${item.sl}</p>
      </div>

   <div style="display:flex;align-items:center;gap:8px;">
<div class="payment-box">
 <select 
  class="multiplier"
  onchange="onMultiplierChange(this, ${item.amount})"
>

    <option value="1">1×</option>
    <option value="2">2×</option>
    <option value="3">3×</option>
  </select>

  <input
    type="number"
    class="paid-amount"
    value="${item.amount}"
    min="0"
  />

  <div class="button-group">
    <button class="mark-btn">Mark Paid</button>
    <button class="remove-btn">Remove</button>
  </div>
</div>

</div>

    `;

    card.querySelector(".mark-btn").addEventListener("click", () => {
      dailyStatus = dailyStatus.filter((d) => d.sl !== item.sl);

      const paidAmount = Number(card.querySelector(".paid-amount").value);

      dailyStatus = dailyStatus.filter((d) => d.sl !== item.sl);

      dailyStatus.push({
        sl: item.sl,
        status: "collected",
        paidAmount,
      });

      localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));
      location.reload();

      localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));
      location.reload();
    });

    card.querySelector(".remove-btn").addEventListener("click", () => {
      const confirmRemove = confirm(
        `Remove ${item.name} from this month's list?`
      );

      if (!confirmRemove) return;

      // 1️⃣ Remove from monthly list
      monthlyData.clients = monthlyData.clients.filter((c) => c.sl !== item.sl);

      localStorage.setItem("monthlyClients", JSON.stringify(monthlyData));

      // 2️⃣ Also remove from today's status if exists
      dailyStatus = dailyStatus.filter((d) => d.sl !== item.sl);
      localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));

      location.reload();
    });

    pendingBody.appendChild(card);
  });

  if (collected.length === 0) {
    collectedEmpty.style.display = "block";
  } else {
    collectedEmpty.style.display = "none";

    collected.forEach((item) => {
      const card = document.createElement("div");
      card.className = "client-card";

      card.innerHTML = `
    <div class="client-info">
      <h3>${item.name}</h3>
      <p>SL ${item.sl}</p>
    </div>

    <div style="display:flex;align-items:center;gap:10px;">
      <div class="amount">₹${item.amount}</div>
      <button class="undo-btn">Undo</button>
    </div>
  `;

      card.querySelector(".undo-btn").addEventListener("click", () => {
        dailyStatus = dailyStatus.filter((d) => d.sl !== item.sl);
        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));
        location.reload();
        // Alternatively, to just change status without removing entry:
        location.reload();
      });

      collectedBody.appendChild(card);
    });
  }

  setInterval(updateDate, 60000);
});
