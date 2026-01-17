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

/* ================= ENHANCED DATE DISPLAY ================= */
function showTodayDate() {
  const today = new Date();
  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
    weekday: "short",
  };
  const formattedDate = today.toLocaleDateString("en-GB", options);
  document.getElementById("todayDate").textContent = formattedDate;
}
showTodayDate();

/* ================= MONTH NAVIGATION ================= */
let currentViewDate = new Date();

function updateMonthDisplay() {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthName = monthNames[currentViewDate.getMonth()];
  const year = currentViewDate.getFullYear();
  
  document.getElementById("currentMonthDisplay").textContent = 
    `${monthName} ${year}`;
  
  // Update active button
  const now = new Date();
  const isCurrentMonth = 
    currentViewDate.getMonth() === now.getMonth() && 
    currentViewDate.getFullYear() === now.getFullYear();
  
  document.getElementById("currentMonthBtn").classList.toggle("active", isCurrentMonth);
}

// Month navigation buttons
document.getElementById("prevMonth")?.addEventListener("click", () => {
  currentViewDate.setMonth(currentViewDate.getMonth() - 1);
  updateMonthDisplay();
  loadMonthlyClients();
});

document.getElementById("nextMonth")?.addEventListener("click", () => {
  currentViewDate.setMonth(currentViewDate.getMonth() + 1);
  updateMonthDisplay();
  loadMonthlyClients();
});

document.getElementById("currentMonthBtn")?.addEventListener("click", () => {
  currentViewDate = new Date();
  updateMonthDisplay();
  loadMonthlyClients();
});

/* ================= DYNAMIC MONTH HEADER ================= */
function generateMonthDates() {
  const headerRow = document.getElementById("tableHeader");
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth(); // 0-based

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Clear existing date columns (keeping SL, Name, and Total)
  while (headerRow.children.length > 3) {
    headerRow.removeChild(headerRow.children[2]);
  }

  // Add date columns
  for (let day = 1; day <= daysInMonth; day++) {
    const th = document.createElement("th");
    
    // Create date object
    const dateObj = new Date(year, month, day);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    
    th.innerHTML = `
      <div style="font-size: 0.85rem; color: var(--text-light);">${dayOfWeek}</div>
      <div style="font-weight: 800; font-size: 1.1rem;">${day}</div>
    `;
    
    th.style.minWidth = "85px";
    th.style.textAlign = "center";
    th.style.padding = "0.75rem 0.5rem";
    
    // Insert before the Total column
    headerRow.insertBefore(th, headerRow.children[headerRow.children.length - 1]);
  }

  updateMonthDisplay();
}

/* ================= ENHANCED CLIENT DATA LOADING ================= */
const tableBody = document.getElementById("clientTable");
const countBox = document.querySelector(".client-count");

function loadMonthlyClients() {
  generateMonthDates(); // Regenerate headers for current month
  
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const currentMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  const monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));

  if (!monthlyData || monthlyData.month !== currentMonthKey) {
    renderTable([]);
    updateSummaryStats(0, 0, 0);
    return;
  }

  const sortedClients = [...monthlyData.clients].sort((a, b) => a.sl - b.sl);
  renderTable(sortedClients);
}

function renderTable(clients) {
  tableBody.innerHTML = "";

  if (clients.length === 0) {
    countBox.textContent = "Total Clients: 0";
    tableBody.innerHTML = `
      <tr>
        <td colspan="100" style="text-align:center; padding:3rem;">
          <div class="empty-state">
            <i class="fa-solid fa-users-slash"></i>
            <p>No clients added for this month</p>
            <small style="color: var(--text-light); margin-top: 0.5rem;">
              Use the Push Client page to add clients to the monthly list
            </small>
          </div>
        </td>
      </tr>
    `;
    document.getElementById("summaryCards").style.display = "none";
    return;
  }

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let grandTotal = 0;
  let totalPayments = 0;
  let maxPossiblePayments = clients.length * daysInMonth;

  clients.forEach(client => {
    const row = document.createElement("tr");

    let cells = `
      <td>${client.sl}</td>
      <td>
        <div style="font-weight: 600;">${client.name}</div>
        <small style="color: var(--text-light); font-size: 0.85rem;">
          Policy: ${client.policyNo || 'N/A'}
        </small>
      </td>
    `;

    let clientSum = 0;
    let clientPaymentCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(Date.UTC(year, month, day));
      const dateKey = dateObj.toISOString().split("T")[0];
      
      const paymentKey = `payment-${dateKey}`;
      const paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];
      const paid = paymentData.find(p => p.sl === client.sl);

      if (paid) {
        cells += `<td><div class="paid">₹${paid.amount}</div></td>`;
        clientSum += paid.amount;
        clientPaymentCount++;
        totalPayments++;
      } else {
        // Check if this date is in the future
        const today = new Date();
        const currentDate = new Date(year, month, day);
        const isFuture = currentDate > today;
        
        cells += `<td><div class="unpaid">${isFuture ? '—' : 'Pending'}</div></td>`;
      }
    }

    // Client total cell
    cells += `<td><div class="paid" style="background: linear-gradient(135deg, #d1fae5 0%, #86efac 100%);">₹${clientSum}</div></td>`;

    row.innerHTML = cells;
    tableBody.appendChild(row);

    grandTotal += clientSum;
  });

  // Total row
  const totalRow = document.createElement("tr");
  totalRow.className = "total-row";
  
  let totalCells = `
    <td><i class="fa-solid fa-calculator"></i></td>
    <td style="font-weight: 700;">Monthly Total</td>
  `;

  // Add empty cells for each day
  for (let day = 1; day <= daysInMonth; day++) {
    totalCells += `<td>—</td>`;
  }

  // Grand total cell
  totalCells += `<td style="font-size: 1.2rem;">₹${grandTotal}</td>`;
  
  totalRow.innerHTML = totalCells;
  tableBody.appendChild(totalRow);

  // Update client count
  countBox.textContent = `Total Clients: ${clients.length}`;
  countBox.innerHTML = `<i class="fa-solid fa-users"></i> Total Clients: ${clients.length}`;

  // Update summary stats
  const collectionRate = maxPossiblePayments > 0 ? 
    Math.round((totalPayments / maxPossiblePayments) * 100) : 0;
  
  updateSummaryStats(grandTotal, totalPayments, collectionRate);
}

function updateSummaryStats(totalCollected, pendingCount, collectionRate) {
  document.getElementById("summaryCards").style.display = "grid";
  document.getElementById("totalCollected").textContent = `₹${totalCollected}`;
  document.getElementById("pendingPayments").textContent = pendingCount;
  document.getElementById("collectionRate").textContent = `${collectionRate}%`;
}

/* ================= ENHANCED SEARCH ================= */
let searchTimeout;
document.querySelector(".search-box")?.addEventListener("input", function(e) {
  clearTimeout(searchTimeout);
  const searchTerm = e.target.value.toLowerCase().trim();
  
  searchTimeout = setTimeout(() => {
    const monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));
    if (!monthlyData) return;

    const filtered = monthlyData.clients.filter(c =>
      c.sl.toString().includes(searchTerm) ||
      c.name.toLowerCase().includes(searchTerm)
    );

    renderTable(filtered);
    
    // Update count for filtered results
    const countBox = document.querySelector(".client-count");
    if (searchTerm) {
      countBox.innerHTML = `<i class="fa-solid fa-filter"></i> Filtered: ${filtered.length}`;
    } else {
      countBox.innerHTML = `<i class="fa-solid fa-users"></i> Total Clients: ${filtered.length}`;
    }
  }, 300);
});

/* ================= INITIAL LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
  // Set initial date to current month
  currentViewDate = new Date();
  updateMonthDisplay();
  
  // Load data
  loadMonthlyClients();
  
  // Refresh data every 30 seconds
  setInterval(loadMonthlyClients, 30000);
});