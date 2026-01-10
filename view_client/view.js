let scrollPosition = 0;

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const body = document.body;

  const isOpening = !sidebar.classList.contains("active");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

  if (isOpening) {
    // Save scroll position
    scrollPosition = window.scrollY;

    body.classList.add("sidebar-open");
    body.style.position = "fixed";
    body.style.top = `-${scrollPosition}px`;
    body.style.width = "100%";
  } else {
    // Restore scroll position
    body.classList.remove("sidebar-open");
    body.style.position = "";
    body.style.top = "";
    body.style.width = "";

    window.scrollTo(0, scrollPosition);
  }
}
