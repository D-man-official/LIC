

let scrollPosition = 0;

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const body = document.body;

    const isOpening = !sidebar.classList.contains("active");

    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');

    if (isOpening) {
        // Save current scroll position
        scrollPosition = window.scrollY;

        body.classList.add('sidebar-open');
        body.style.top = `-${scrollPosition}px`;
    } else {
        // Restore scroll position
        body.classList.remove('sidebar-open');
        body.style.top = '';

        window.scrollTo(0, scrollPosition);
    }
}
