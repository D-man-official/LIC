let scrollPosition = 0;

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const body = document.body;

  const isOpening = !sidebar.classList.contains("active");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

  if (isOpening) {
    // Save current scroll position
    scrollPosition = window.scrollY;

    body.classList.add("sidebar-open");
    body.style.top = `-${scrollPosition}px`;
  } else {
    // Restore scroll position
    body.classList.remove("sidebar-open");
    body.style.top = "";

    window.scrollTo(0, scrollPosition);
  }
}


// ===== Today Date Module =====
function updateDate() {
  const today = new Date();

  const options = {
  
    month: "short",
    year: "numeric",
  };

  const formattedDate = today
    .toLocaleDateString("en-GB", options)
    .toUpperCase();

  document.getElementById("todayDate").textContent = formattedDate;
}

// Run once when page loads
updateDate();

// Optional: refresh every minute (keeps date correct after midnight)
setInterval(updateDate, 60000);


// ===== Auto Date Module =====
(function () {
  const dateElement = document.getElementById("autoDate");

  function refreshDate() {
    const today = new Date();

    const formatted = today
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short"
      })
      .toUpperCase();

    dateElement.textContent = formatted;
  }

  // Initial load
  refreshDate();

  // Auto refresh every minute
  setInterval(refreshDate, 60000);
})();

function loadClientCount() {
  const clients = JSON.parse(localStorage.getItem("clients")) || [];
  document.getElementById("totalClients").textContent = clients.length;
}

loadClientCount();


// ===== Load Today's Collection from Daily Page =====
document.addEventListener("DOMContentLoaded", () => {
  const todayAmount =
    Number(localStorage.getItem("todayCollectionAmount")) || 0;

  const amountEl = document.getElementById("todayCollectionAmount");

  if (amountEl) {
    amountEl.textContent = `₹${todayAmount}`;
  }
});


// ===== Load Monthly Collection (SAFE METHOD) =====
document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

  let monthlyTotal = 0;

  // Loop through all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // Match only dailyStatus of current month
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
});
