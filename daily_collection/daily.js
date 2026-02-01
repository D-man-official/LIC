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
  const specialBody = document.getElementById("specialBody");
  const collectedEmpty = document.getElementById("collectedEmpty");
  const pendingHeader = document.getElementById("pendingHeader");
  const collectedHeader = document.getElementById("collectedHeader");
  const specialHeader = document.getElementById("specialHeader");

  // Get active month from activeDate
  const activeMonth = activeDate.slice(0, 7); // "2026-01"

  // Load ALL monthly data (all months) - NEW STRUCTURE
  let allMonthlyData = JSON.parse(localStorage.getItem("monthlyClients")) || {};
  let allSpecialMonthlyData = JSON.parse(localStorage.getItem("specialMonthlyClients")) || {};
  
  // Get data for ACTIVE MONTH only
  let monthlyData = {
    month: activeMonth,
    clients: allMonthlyData[activeMonth] || []
  };
  
  let specialMonthlyData = {
    month: activeMonth,
    clients: allSpecialMonthlyData[activeMonth] || []
  };

  const dailyKey = `dailyStatus-${activeDate}`;
  let dailyStatus = JSON.parse(localStorage.getItem(dailyKey)) || [];

  const pending = [];
  const collected = [];
  const special = [];

  // Process regular clients
  monthlyData.clients.forEach(client => {
    const statusEntry = dailyStatus.find(d => d.sl === client.sl && !d.isSpecial);
    const status = statusEntry ? statusEntry.status : "pending";

    const record = {
      sl: client.sl,
      name: client.name,
      amount: statusEntry?.paidAmount ?? client.amount,
      status,
      isSpecial: false
    };

    if (status === "pending") pending.push(record);
    else collected.push(record);
  });

  // Process special clients (from "1" button)
  specialMonthlyData.clients.forEach(client => {
    const statusEntry = dailyStatus.find(d => d.sl === client.sl && d.isSpecial);
    const status = statusEntry ? statusEntry.status : "pending";

    const record = {
      sl: client.sl,
      name: client.name,
      amount: statusEntry?.paidAmount ?? client.amount,
      status,
      isSpecial: true,
      policyNo: client.policyNo || "-"
    };

    if (status === "pending") special.push(record);
    else collected.push(record);
  });

  // Sort by serial number
  pending.sort((a, b) => a.sl - b.sl);
  collected.sort((a, b) => a.sl - b.sl);
  special.sort((a, b) => a.sl - b.sl);

  // Daily total collected
  const totalCollectedAmount = collected.reduce((sum, item) => sum + Number(item.amount), 0);
  localStorage.setItem("todayCollectionAmount", totalCollectedAmount);

  // Update headers
  pendingHeader.innerHTML = `<i class="fa-solid fa-clock" style="color:var(--orange)"></i> Pending (${pending.length})`;
  collectedHeader.innerHTML = `
    <i class="fa-solid fa-circle-check" style="color:var(--green)"></i>
    Collected (${collected.length}) • ₹${totalCollectedAmount}
  `;
  if (specialHeader) {
  specialHeader.innerHTML = `
    <i class="fa-solid fa-1" style="color:#8b5cf6"></i>
    Monthly Pay Clients (${special.length})
  `;
}


  pendingBody.innerHTML = "";
  collectedBody.innerHTML = "";
  specialBody.innerHTML = "";

  // ─── Regular Pending Clients ──────────────────────────────────────
  if (pending.length === 0) {
    pendingBody.innerHTML = '<div class="empty"><i class="fa-regular fa-folder-open"></i><p>No pending clients</p></div>';
  } else {
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
        paymentData.push({ 
          sl: item.sl, 
          amount: paidAmount,
          isSpecial: false 
        });
        localStorage.setItem(paymentKey, JSON.stringify(paymentData));

        dailyStatus = dailyStatus.filter(d => d.sl !== item.sl);
        dailyStatus.push({
          sl: item.sl,
          status: "collected",
          paidAmount,
          isSpecial: false
        });

        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));
        location.reload();
      });

      // Remove from monthly list
      card.querySelector(".remove-btn").addEventListener("click", () => {
        if (!confirm(`Remove ${item.name} from this month's list?`)) return;

        // Get all monthly data
        let allMonthlyData = JSON.parse(localStorage.getItem("monthlyClients")) || {};
        
        // Remove from active month
        if (allMonthlyData[activeMonth]) {
          allMonthlyData[activeMonth] = allMonthlyData[activeMonth].filter(c => c.sl !== item.sl);
          localStorage.setItem("monthlyClients", JSON.stringify(allMonthlyData));
        }

        dailyStatus = dailyStatus.filter(d => d.sl !== item.sl);
        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));

        location.reload();
      });

      pendingBody.appendChild(card);
    });
  }

  // ─── Special Clients (from "1" button) ─────────────────────────────
  if (special.length === 0) {
    specialBody.innerHTML = '<div class="special-empty"><p>No clients added yet !</p></div>';
  } else {
    special.forEach(item => {
      const card = document.createElement("div");
      card.className = "special-client-card";

      card.innerHTML = `
        <div class="special-info">
          <h3>${item.name}</h3>
          <p>SL ${item.sl} ${item.policyNo && item.policyNo !== "-" ? `• Policy: ${item.policyNo}` : ''}</p>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <div class="special-amount">₹${item.amount}</div>
          <div class="special-controls">
            <button class="special-mark-btn">Mark Paid</button>
            <button class="special-remove-btn">Remove</button>
          </div>
        </div>
      `;

      // Mark as Paid (Special)
      card.querySelector(".special-mark-btn").addEventListener("click", () => {
        const paidAmount = item.amount;

        const paymentKey = `payment-${activeDate}`;
        let paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];

        paymentData = paymentData.filter(p => p.sl !== item.sl || !p.isSpecial);
        paymentData.push({ 
          sl: item.sl, 
          amount: paidAmount,
          isSpecial: true 
        });
        localStorage.setItem(paymentKey, JSON.stringify(paymentData));

        dailyStatus = dailyStatus.filter(d => !(d.sl === item.sl && d.isSpecial));
        dailyStatus.push({
          sl: item.sl,
          status: "collected",
          paidAmount,
          isSpecial: true
        });

        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));
        location.reload();
      });

      // Remove from special monthly list
      card.querySelector(".special-remove-btn").addEventListener("click", () => {
        if (!confirm(`Remove ${item.name} from special list?`)) return;

        // Get all special monthly data
        let allSpecialMonthlyData = JSON.parse(localStorage.getItem("specialMonthlyClients")) || {};
        
        // Remove from active month
        if (allSpecialMonthlyData[activeMonth]) {
          allSpecialMonthlyData[activeMonth] = allSpecialMonthlyData[activeMonth].filter(c => c.sl !== item.sl);
          localStorage.setItem("specialMonthlyClients", JSON.stringify(allSpecialMonthlyData));
        }

        dailyStatus = dailyStatus.filter(d => !(d.sl === item.sl && d.isSpecial));
        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));

        location.reload();
      });

      specialBody.appendChild(card);
    });
  }

  // ─── Collected Section ────────────────────────────────────
  if (collected.length === 0) {
    collectedEmpty.style.display = "block";
  } else {
    collectedEmpty.style.display = "none";

    collected.forEach(item => {
      const card = document.createElement("div");
      card.className = "client-card";
      
      if (item.isSpecial) {
        card.style.borderLeft = "4px solid #8b5cf6";
        card.style.background = "#faf5ff";
      }

      card.innerHTML = `
        <div class="client-info">
          <h3>${item.name} ${item.isSpecial ? '<span style="background:#8b5cf6; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem;">1</span>' : ''}</h3>
          <p>SL ${item.sl}</p>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="amount">₹${item.amount}</div>
          <button class="undo-btn">Undo</button>
        </div>
      `;

      card.querySelector(".undo-btn").addEventListener("click", () => {
        dailyStatus = dailyStatus.filter(d => !(d.sl === item.sl && d.isSpecial === item.isSpecial));
        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));

        const paymentKey = `payment-${activeDate}`;
        let paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];
        paymentData = paymentData.filter(p => !(p.sl === item.sl && p.isSpecial === item.isSpecial));
        localStorage.setItem(paymentKey, JSON.stringify(paymentData));

        location.reload();
      });

      collectedBody.appendChild(card);
    });
  }
});