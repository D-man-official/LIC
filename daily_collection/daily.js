
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