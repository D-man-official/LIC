/* ================= SIDEBAR ================= */
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
    body.style.position = "fixed";
    body.style.top = `-${scrollPosition}px`;
  } else {
    body.style.position = "";
    body.style.top = "";
    window.scrollTo(0, scrollPosition);
  }
}

/* ================= FULL DATE ================= */
function showTodayDate() {
  const today = new Date();

  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  };

  document.getElementById("todayDate").textContent =
    today.toLocaleDateString("en-GB", options);
}
showTodayDate();

/* ================= DYNAMIC MONTH HEADER ================= */
function generateMonthDates() {
  const headerRow = document.getElementById("tableHeader");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const th = document.createElement("th");
    th.textContent = day;
    headerRow.appendChild(th);
  }
}
generateMonthDates();

/* ================= CLIENT DATA ================= */
const table = document.getElementById("clientTable");
const countBox = document.querySelector(".client-count");

function loadMonthlyClients() {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

  const monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));

  if (!monthlyData || monthlyData.month !== currentMonth) {
    renderTable([]);
    return;
  }

  // 🔹 SL ascending order
  const sortedClients = [...monthlyData.clients].sort(
    (a, b) => a.sl - b.sl
  );

  renderTable(sortedClients);
}


function renderTable(data) {
  table.innerHTML = "";

  data.forEach(client => {
    const row = document.createElement("tr");

    let cells = `
      <td>${client.sl}</td>
      <td>${client.name}</td>
    `;

    // Empty cells for each date
    const now = new Date();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= days; i++) {
      cells += `<td></td>`;
    }

    row.innerHTML = cells;
    table.appendChild(row);
  });

  countBox.textContent = `Total Clients: ${data.length}`;
}

loadMonthlyClients();

