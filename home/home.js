// ===== Sidebar Toggle =====
let scrollPosition = 0;

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const body = document.body;

  const isOpening = !sidebar.classList.contains("active");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

  if (isOpening) {
    scrollPosition = window.scrollY;
    body.classList.add("sidebar-open");
    body.style.top = `-${scrollPosition}px`;
  } else {
    body.classList.remove("sidebar-open");
    body.style.top = "";
    window.scrollTo(0, scrollPosition);
  }
}

// ===== Month & Year Display (e.g. JAN 2026) =====
function updateDate() {
  const today = new Date();
  const options = {
    month: "short",
    year: "numeric",
  };
  const formatted = today.toLocaleDateString("en-GB", options).toUpperCase();
  document.getElementById("todayDate").textContent = formatted;
}
updateDate();
setInterval(updateDate, 60000); // Refresh every minute

// ===== Day & Short Month (e.g. 17 JAN) =====
(function () {
  const dateElement = document.getElementById("autoDate");

  function refreshDate() {
    const today = new Date();
    const formatted = today
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      .toUpperCase();
    dateElement.textContent = formatted;
  }

  refreshDate();
  setInterval(refreshDate, 60000);
})();

// ===== Current Month Total Clients =====
function loadCurrentMonthClientCount() {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // "2026-01"

  const monthlyData = JSON.parse(localStorage.getItem("monthlyClients")) || null;

  const count = (monthlyData && monthlyData.month === currentMonth)
    ? monthlyData.clients.length
    : 0;

  const totalClientsEl = document.getElementById("totalClients");
  if (totalClientsEl) {
    totalClientsEl.textContent = count;
  }
}

// ===== Today's Collection (with auto reset on new day) =====
function loadTodayCollection() {
  const todayISO = new Date().toISOString().split("T")[0]; // "2026-01-17"

  let todayAmount = Number(localStorage.getItem("todayCollectionAmount")) || 0;
  const savedDate = localStorage.getItem("todayCollectionDate");

  // If date changed → reset to 0
  if (savedDate !== todayISO) {
    todayAmount = 0;
    localStorage.setItem("todayCollectionAmount", "0");
    localStorage.setItem("todayCollectionDate", todayISO);
  }

  const amountEl = document.getElementById("todayCollectionAmount");
  if (amountEl) {
    amountEl.textContent = `₹${todayAmount}`;
  }
}

// ===== Monthly Collection (sum from all dailyStatus of current month) =====
function loadMonthlyCollection() {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  let monthlyTotal = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("dailyStatus-") && key.includes(currentMonth)) {
      const dailyData = JSON.parse(localStorage.getItem(key)) || [];
      dailyData.forEach(entry => {
        if (entry.status === "collected" && entry.paidAmount) {
          monthlyTotal += Number(entry.paidAmount);
        }
      });
    }
  }

  const monthlyEl = document.getElementById("monthlyCollectionAmount");
  if (monthlyEl) {
    monthlyEl.textContent = `₹${monthlyTotal}`;
  }
}

// ===== Load everything when page loads =====
document.addEventListener("DOMContentLoaded", () => {
  loadCurrentMonthClientCount();
  loadTodayCollection();
  loadMonthlyCollection();
  loadTotalLICHolders();

  // Refresh counts when coming back to tab
  window.addEventListener("focus", () => {
    loadCurrentMonthClientCount();
    loadTodayCollection();
    loadMonthlyCollection();
  });
});


// ===== Total LIC Holders (from all clients in database) =====
function loadTotalLICHolders() {
  const clients = JSON.parse(localStorage.getItem("clients")) || [];
  const total = clients.length;
  const totalEl = document.getElementById("totalLICHolders");
  if (totalEl) {
    totalEl.textContent = total;
  }
}

window.addEventListener("focus", () => {
  // ... existing code ...
  loadTotalLICHolders();
});

// ===== Logged in user name + animation =====
document.addEventListener("DOMContentLoaded", () => {
  const userNameEl = document.getElementById("userName");
  const loggedUser = localStorage.getItem("loggedInUser");

  if (loggedUser && userNameEl) {
    userNameEl.textContent = loggedUser.toUpperCase();

    // animation start state
    userNameEl.style.opacity = "0";
    userNameEl.style.transform = "translateY(10px)";

    // animate in
    setTimeout(() => {
      userNameEl.style.transition = "all 0.6s ease";
      userNameEl.style.opacity = "1";
      userNameEl.style.transform = "translateY(0)";
    }, 150);
  }
});
