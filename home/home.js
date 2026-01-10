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
    const count = localStorage.getItem("totalClients") || 0;
    document.getElementById("totalClients").textContent = count;
}

loadClientCount();