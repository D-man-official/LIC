
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

const currentPage = window.location.pathname.split("/").pop();
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach(item => {
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
