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

// Helper function to format numbers with commas
function formatNumber(num) {
  if (!num && num !== 0) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

  // Add CSS for sticky total column
  addStickyTotalStyles();

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

    // Create date columns
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(Date.UTC(year, month, day));
      const dateKey = dateObj.toISOString().split("T")[0];
      
      const paymentKey = `payment-${dateKey}`;
      const paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];
      const paid = paymentData.find(p => p.sl === client.sl);

      if (paid) {
        cells += `<td><div class="paid">₹${formatNumber(paid.amount)}</div></td>`;
        clientSum += paid.amount;
        clientPaymentCount++;
        totalPayments++;
      } else {
        const today = new Date();
        const currentDate = new Date(year, month, day);
        const isFuture = currentDate > today;
        
        cells += `<td><div class="unpaid">${isFuture ? '—' : 'Pending'}</div></td>`;
      }
    }

    // Client total cell - STICKY RIGHT
    cells += `<td class="sticky-total">₹${formatNumber(clientSum)}</td>`;

    row.innerHTML = cells;
    tableBody.appendChild(row);

    grandTotal += clientSum;
  });

  // Total row with grand total
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

  // Grand total cell - STICKY RIGHT with special styling
  totalCells += `
    <td class="grand-total">
      <div style="font-size: 1.2rem; font-weight: 900;">₹${formatNumber(grandTotal)}</div>
      <div style="font-size:0.7rem; font-weight:500; margin-top:2px; color:#d1fae5;">
        ${clients.length} clients
      </div>
    </td>
  `;
  
  totalRow.innerHTML = totalCells;
  tableBody.appendChild(totalRow);

  // Update client count
  countBox.innerHTML = `<i class="fa-solid fa-users"></i> Total Clients: ${clients.length}`;

  // Update summary stats
  const collectionRate = maxPossiblePayments > 0 ? 
    Math.round((totalPayments / maxPossiblePayments) * 100) : 0;
  
  updateSummaryStats(grandTotal, totalPayments, collectionRate);
}

// Add CSS for sticky total column
function addStickyTotalStyles() {
  if (document.getElementById('sticky-total-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'sticky-total-styles';
  style.textContent = `
    /* Total column for individual clients */
    .sticky-total {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
      font-weight: 800 !important;
      color: #065f46 !important;
      text-align: center !important;
      padding: 1rem 0.75rem !important;
      border-left: 2px solid #10b981 !important;
      min-width: 120px !important;
    }
    
    /* Grand total column */
    .grand-total {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
      color: white !important;
      font-weight: 900 !important;
      text-align: center !important;
      padding: 1rem 0.75rem !important;
      border-left: 2px solid #047857 !important;
      min-width: 120px !important;
    }
    
    /* Ensure hover states work */
    tbody tr:hover .sticky-total {
      background: linear-gradient(135deg, #a7f3d0 0%, #86efac 100%) !important;
    }
    
    tbody tr:hover .grand-total {
      background: linear-gradient(135deg, #047857 0%, #059669 100%) !important;
    }
    
    /* Fix for mobile responsiveness */
    @media (max-width: 768px) {
      .sticky-total, .grand-total {
        min-width: 100px !important;
        padding: 0.75rem 0.5rem !important;
        font-size: 0.9rem !important;
      }
      
      .grand-total div {
        font-size: 0.85rem !important;
      }
    }
`;
  document.head.appendChild(style);
}

function updateSummaryStats(totalCollected, pendingCount, collectionRate) {
  document.getElementById("summaryCards").style.display = "grid";
  document.getElementById("totalCollected").textContent = `₹${formatNumber(totalCollected)}`;
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


function generatePDFReport() {
  // Check if jsPDF is available
  if (typeof window.jspdf === 'undefined') {
    alert("PDF library is loading. Please wait a moment and try again.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const now = currentViewDate;
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138); // Blue color
  doc.text(`LIC Collection Report - ${currentMonth} ${currentYear}`, 14, 22);
  
  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text("Generated on: " + new Date().toLocaleDateString('en-GB'), 14, 30);
  
  // Get table data
  const table = document.querySelector('table');
  const rows = table.querySelectorAll('tbody tr:not(.total-row)');
  
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  // Create PDF in chunks of 10 days
  for(let pageStart = 1; pageStart <= daysInMonth; pageStart += 10) {
    const pageEnd = Math.min(pageStart + 9, daysInMonth);
    
    if(pageStart > 1) {
      doc.addPage();
    }
    
    // Table headers
    const headers = [["SL No", "Client Name"]];
    
    // Add date headers
    for(let day = pageStart; day <= pageEnd; day++) {
      headers[0].push(`Day ${day}`);
    }
    
    headers[0].push("Total");
    
    // Prepare table data
    const tableData = [];
    let rowNumber = 1;
    
    rows.forEach(row => {
      if (row.classList.contains('total-row')) return;
      
      const cells = row.querySelectorAll('td');
      if(cells.length > 0) {
        const rowData = [rowNumber++, cells[1]?.textContent?.split('\n')[0] || ""];
        
        let total = 0;
        
        // Get day amounts
        for(let day = pageStart; day <= pageEnd; day++) {
          const dayCell = cells[day + 1]; // +1 because SL is first
          if (dayCell) {
            const amountText = dayCell.textContent.replace('₹', '').replace(/,/g, '');
            const amount = parseFloat(amountText) || 0;
            rowData.push(amount > 0 ? `₹${amount}` : "-");
            total += amount;
          } else {
            rowData.push("-");
          }
        }
        
        rowData.push(`₹${total}`);
        tableData.push(rowData);
      }
    });
    
    // Page header
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.text(`Days: ${pageStart} - ${pageEnd} ${currentMonth}`, 14, 40);
    
    // Create table
    doc.autoTable({
      startY: 45,
      head: headers,
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138], // Blue
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40 }
    });
  }
  
  // Footer with page numbers
  const totalPages = doc.internal.getNumberOfPages();
  for(let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i}/${totalPages} • LIC Collection System`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save PDF
  doc.save(`LIC_Collection_${currentMonth}_${currentYear}.pdf`);
}

/* ================= INITIAL LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
  // Set initial date to current month
  currentViewDate = new Date();
  updateMonthDisplay();
  
  // Load data
  loadMonthlyClients();
  
  // Add PDF button styles
  const pdfButtonStyle = document.createElement('style');
  pdfButtonStyle.textContent = `
    .pdf-button {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      margin: 20px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
      width: 100%;
      max-width: 300px;
    }
    
    .pdf-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }
    
    .pdf-button:active {
      transform: translateY(0);
    }
    
    .pdf-button i {
      font-size: 1.2rem;
    }
  `;
  document.head.appendChild(pdfButtonStyle);
  
  // Refresh data every 30 seconds
  setInterval(loadMonthlyClients, 30000);
});