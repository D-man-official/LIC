function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

// ===== Multiplier Logic =====
function onMultiplierChange(selectEl, baseAmount) {
  const multiplier = Number(selectEl.value);
  const card = selectEl.closest(".client-card");
  const amountInput = card.querySelector(".paid-amount");

  amountInput.value = baseAmount * multiplier;
}

// ===== Active Menu Highlight =====
const currentPage = window.location.pathname.split("/").pop();
const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach((item) => {
  const linkPage = item.getAttribute("href").split("/").pop();
  if (linkPage === currentPage) {
    item.classList.add("active");
  }
});

// ===== Main Daily Collection Logic =====
document.addEventListener("DOMContentLoaded", () => {
  const dateDisplay = document.getElementById("todayDate");
  const dateInput = document.getElementById("selectedDate");

  // Format date: 17 JAN 2026
  function formatDisplayDate(isoString) {
    const date = new Date(isoString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).toUpperCase();
  }

  // Initialize date (always start with today if invalid)
  const todayISO = new Date().toISOString().split("T")[0];
  let activeDate = localStorage.getItem("activeDate");

  if (!activeDate || activeDate > todayISO) {
    activeDate = todayISO;
    localStorage.setItem("activeDate", activeDate);
  }

  dateInput.value = activeDate;
  dateDisplay.textContent = formatDisplayDate(activeDate);

  // Date change → save and reload
  dateInput.addEventListener("change", () => {
    if (dateInput.value) {
      localStorage.setItem("activeDate", dateInput.value);
      dateDisplay.textContent = formatDisplayDate(dateInput.value);
      location.reload();
    }
  });

  // Gentle live update for today's date only
  setInterval(() => {
    const currentActive = localStorage.getItem("activeDate");
    if (currentActive === todayISO) {
      dateDisplay.textContent = formatDisplayDate(todayISO);
    }
  }, 60000);

  // ────────────────────────────────────────────────────────
  //                DAILY COLLECTION CORE
  // ────────────────────────────────────────────────────────

  const pendingBody = document.getElementById("pendingBody");
  const collectedBody = document.getElementById("collectedBody");
  const specialBody = document.getElementById("specialBody");
  const collectedEmpty = document.getElementById("collectedEmpty");
  const pendingHeader = document.getElementById("pendingHeader");
  const collectedHeader = document.getElementById("collectedHeader");
  const specialHeader = document.getElementById("specialHeader");

  // Get active month from activeDate
  const activeMonth = activeDate.slice(0, 7); // "2026-01"

  // Load ALL monthly data (all months) - NEW STRUCTURE
  let allMonthlyData = JSON.parse(localStorage.getItem("monthlyClients")) || {};
  let allSpecialMonthlyData = JSON.parse(localStorage.getItem("specialMonthlyClients")) || {};
  
  // Get data for ACTIVE MONTH only
  let monthlyData = {
    month: activeMonth,
    clients: allMonthlyData[activeMonth] || []
  };
  
  let specialMonthlyData = {
    month: activeMonth,
    clients: allSpecialMonthlyData[activeMonth] || []
  };

  const dailyKey = `dailyStatus-${activeDate}`;
  let dailyStatus = JSON.parse(localStorage.getItem(dailyKey)) || [];

  const pending = [];
  const collected = [];
  const special = [];

  // Process regular clients
  monthlyData.clients.forEach(client => {
    const statusEntry = dailyStatus.find(d => d.sl === client.sl && !d.isSpecial);
    const status = statusEntry ? statusEntry.status : "pending";

    const record = {
      sl: client.sl,
      name: client.name,
      amount: statusEntry?.paidAmount ?? client.amount,
      status,
      isSpecial: false
    };

    if (status === "pending") pending.push(record);
    else collected.push(record);
  });

  // Process special clients (from "1" button)
  specialMonthlyData.clients.forEach(client => {
    const statusEntry = dailyStatus.find(d => d.sl === client.sl && d.isSpecial);
    const status = statusEntry ? statusEntry.status : "pending";

    const record = {
      sl: client.sl,
      name: client.name,
      amount: statusEntry?.paidAmount ?? client.amount,
      status,
      isSpecial: true,
      policyNo: client.policyNo || "-"
    };

    if (status === "pending") special.push(record);
    else collected.push(record);
  });

  // Sort by serial number
  pending.sort((a, b) => a.sl - b.sl);
  collected.sort((a, b) => a.sl - b.sl);
  special.sort((a, b) => a.sl - b.sl);

  // Daily total collected
  const totalCollectedAmount = collected.reduce((sum, item) => sum + Number(item.amount), 0);
  localStorage.setItem("todayCollectionAmount", totalCollectedAmount);

  // Update headers
  pendingHeader.innerHTML = `<i class="fa-solid fa-clock" style="color:var(--orange)"></i> Pending (${pending.length})`;
  collectedHeader.innerHTML = `
    <i class="fa-solid fa-circle-check" style="color:var(--green)"></i>
    Collected (${collected.length}) • ₹${totalCollectedAmount}
  `;
  if (specialHeader) {
  specialHeader.innerHTML = `
    <i class="fa-solid fa-1" style="color:#8b5cf6"></i>
    Monthly Pay Clients (${special.length})
  `;
}


  pendingBody.innerHTML = "";
  collectedBody.innerHTML = "";
  specialBody.innerHTML = "";

  // ─── Regular Pending Clients ──────────────────────────────────────
  if (pending.length === 0) {
    pendingBody.innerHTML = '<div class="empty"><i class="fa-regular fa-folder-open"></i><p>No pending clients</p></div>';
  } else {
    pending.forEach(item => {
      const card = document.createElement("div");
      card.className = "client-card";

      card.innerHTML = `
        <div class="client-info">
          <h3>${item.name}</h3>
          <p>SL ${item.sl}</p>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <div class="payment-box">
            <select class="multiplier" onchange="onMultiplierChange(this, ${item.amount})">
              <option value="1">1×</option>
              <option value="2">2×</option>
              <option value="3">3×</option>
              <option value="4">4×</option>
              <option value="5">5×</option>
              <option value="6">6×</option>
            </select>

            <input type="number" class="paid-amount" value="${item.amount}" min="0" />

            <div class="button-group">
              <button class="mark-btn">Mark Paid</button>
              <button class="remove-btn">Remove</button>
            </div>
          </div>
        </div>
      `;

      // Mark as Paid
      card.querySelector(".mark-btn").addEventListener("click", () => {
        const paidAmount = Number(card.querySelector(".paid-amount").value);

        const paymentKey = `payment-${activeDate}`;
        let paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];

        paymentData = paymentData.filter(p => p.sl !== item.sl);
        paymentData.push({ 
          sl: item.sl, 
          amount: paidAmount,
          isSpecial: false 
        });
        localStorage.setItem(paymentKey, JSON.stringify(paymentData));

        dailyStatus = dailyStatus.filter(d => d.sl !== item.sl);
        dailyStatus.push({
          sl: item.sl,
          status: "collected",
          paidAmount,
          isSpecial: false
        });

        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));
        location.reload();
      });

      // Remove from monthly list
      card.querySelector(".remove-btn").addEventListener("click", () => {
        if (!confirm(`Remove ${item.name} from this month's list?`)) return;

        // Get all monthly data
        let allMonthlyData = JSON.parse(localStorage.getItem("monthlyClients")) || {};
        
        // Remove from active month
        if (allMonthlyData[activeMonth]) {
          allMonthlyData[activeMonth] = allMonthlyData[activeMonth].filter(c => c.sl !== item.sl);
          localStorage.setItem("monthlyClients", JSON.stringify(allMonthlyData));
        }

        dailyStatus = dailyStatus.filter(d => d.sl !== item.sl);
        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));

        location.reload();
      });

      pendingBody.appendChild(card);
    });
  }

  // ─── Special Clients (from "1" button) ─────────────────────────────
  if (special.length === 0) {
    specialBody.innerHTML = '<div class="special-empty"><p>No clients added yet !</p></div>';
  } else {
    special.forEach(item => {
      const card = document.createElement("div");
      card.className = "special-client-card";

      card.innerHTML = `
        <div class="special-info">
          <h3>${item.name}</h3>
          <p>SL ${item.sl} ${item.policyNo && item.policyNo !== "-" ? `• Policy: ${item.policyNo}` : ''}</p>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <div class="special-amount">₹${item.amount}</div>
          <div class="special-controls">
            <button class="special-mark-btn">Mark Paid</button>
            <button class="special-remove-btn">Remove</button>
          </div>
        </div>
      `;

      // Mark as Paid (Special)
      card.querySelector(".special-mark-btn").addEventListener("click", () => {
        const paidAmount = item.amount;

        const paymentKey = `payment-${activeDate}`;
        let paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];

        paymentData = paymentData.filter(p => p.sl !== item.sl || !p.isSpecial);
        paymentData.push({ 
          sl: item.sl, 
          amount: paidAmount,
          isSpecial: true 
        });
        localStorage.setItem(paymentKey, JSON.stringify(paymentData));

        dailyStatus = dailyStatus.filter(d => !(d.sl === item.sl && d.isSpecial));
        dailyStatus.push({
          sl: item.sl,
          status: "collected",
          paidAmount,
          isSpecial: true
        });

        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));
        location.reload();
      });

      // Remove from special monthly list
      card.querySelector(".special-remove-btn").addEventListener("click", () => {
        if (!confirm(`Remove ${item.name} from special list?`)) return;

        // Get all special monthly data
        let allSpecialMonthlyData = JSON.parse(localStorage.getItem("specialMonthlyClients")) || {};
        
        // Remove from active month
        if (allSpecialMonthlyData[activeMonth]) {
          allSpecialMonthlyData[activeMonth] = allSpecialMonthlyData[activeMonth].filter(c => c.sl !== item.sl);
          localStorage.setItem("specialMonthlyClients", JSON.stringify(allSpecialMonthlyData));
        }

        dailyStatus = dailyStatus.filter(d => !(d.sl === item.sl && d.isSpecial));
        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));

        location.reload();
      });

      specialBody.appendChild(card);
    });
  }

  // ─── Collected Section ────────────────────────────────────
  if (collected.length === 0) {
    collectedEmpty.style.display = "block";
  } else {
    collectedEmpty.style.display = "none";

    collected.forEach(item => {
      const card = document.createElement("div");
      card.className = "client-card";
      
      if (item.isSpecial) {
        card.style.borderLeft = "4px solid #8b5cf6";
        card.style.background = "#faf5ff";
      }

      card.innerHTML = `
        <div class="client-info">
          <h3>${item.name} ${item.isSpecial ? '<span style="background:#8b5cf6; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem;">1</span>' : ''}</h3>
          <p>SL ${item.sl}</p>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="amount">₹${item.amount}</div>
          <button class="undo-btn">Undo</button>
        </div>
      `;

      card.querySelector(".undo-btn").addEventListener("click", () => {
        dailyStatus = dailyStatus.filter(d => !(d.sl === item.sl && d.isSpecial === item.isSpecial));
        localStorage.setItem(dailyKey, JSON.stringify(dailyStatus));

        const paymentKey = `payment-${activeDate}`;
        let paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];
        paymentData = paymentData.filter(p => !(p.sl === item.sl && p.isSpecial === item.isSpecial));
        localStorage.setItem(paymentKey, JSON.stringify(paymentData));

        location.reload();
      });

      collectedBody.appendChild(card);
    });
  }
});

// ========== MONTH/YEAR PICKER FOR EXPORT ==========
const exportMonthSelect = document.getElementById('exportMonthSelect');
const exportYearSelect = document.getElementById('exportYearSelect');
const selectedMonthDisplay = document.getElementById('selectedMonthDisplay');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const fileName = document.getElementById('fileName');
const transferInfo = document.getElementById('transferInfo');
const exportPreview = document.getElementById('exportPreview');
const previewContent = document.getElementById('previewContent');

// মাসের নাম
const monthNames = {
  '01': 'January', '02': 'February', '03': 'March', '04': 'April',
  '05': 'May', '06': 'June', '07': 'July', '08': 'August',
  '09': 'September', '10': 'October', '11': 'November', '12': 'December'
};

// বছর ড্রপডাউন পপুলেট করুন
function populateYearDropdown() {
  const currentYear = new Date().getFullYear();
  exportYearSelect.innerHTML = '';
  
  // গত ৫ বছর থেকে আগামী ১ বছর পর্যন্ত
  for (let year = currentYear - 5; year <= currentYear + 1; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    exportYearSelect.appendChild(option);
    
    // বর্তমান বছর সিলেক্ট করুন
    if (year === currentYear) {
      option.selected = true;
    }
  }
  
  updateSelectedMonthDisplay();
}

// নির্বাচিত মাস প্রদর্শন করুন
function updateSelectedMonthDisplay() {
  const selectedMonth = exportMonthSelect.value;
  const selectedYear = exportYearSelect.value;
  const monthName = monthNames[selectedMonth];
  
  selectedMonthDisplay.textContent = `${monthName} ${selectedYear}`;
  
  // মাস কী তৈরি করুন
  const monthKey = `${selectedYear}-${selectedMonth}`;
  
  // এই মাসে ডেটা আছে কিনা চেক করুন
  checkMonthData(monthKey);
}

// নির্দিষ্ট মাসে ডেটা আছে কিনা চেক করুন
function checkMonthData(monthKey) {
  const allMonthlyData = JSON.parse(localStorage.getItem('monthlyClients')) || {};
  const allSpecialMonthlyData = JSON.parse(localStorage.getItem('specialMonthlyClients')) || {};
  
  const hasRegularClients = allMonthlyData[monthKey] && allMonthlyData[monthKey].length > 0;
  const hasSpecialClients = allSpecialMonthlyData[monthKey] && allSpecialMonthlyData[monthKey].length > 0;
  
  // ডেইলি পেমেন্ট ডেটা চেক করুন
  let hasDailyData = false;
  const year = parseInt(monthKey.split('-')[0]);
  const month = parseInt(monthKey.split('-')[1]) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const dateKey = `${monthKey}-${dayStr}`;
    const paymentKey = `payment-${dateKey}`;
    const paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];
    
    if (paymentData.length > 0) {
      hasDailyData = true;
      break;
    }
  }
  
  const hasData = hasRegularClients || hasSpecialClients || hasDailyData;
  
  if (hasData) {
    exportBtn.disabled = false;
    exportBtn.style.opacity = '1';
    showExportPreview(monthKey);
  } else {
    exportBtn.disabled = true;
    exportBtn.style.opacity = '0.6';
    hideExportPreview();
    showTransferMessage(`No data found for ${selectedMonthDisplay.textContent}`, 'warning');
  }
}

// Export Preview দেখান
function showExportPreview(monthKey) {
  const allMonthlyData = JSON.parse(localStorage.getItem('monthlyClients')) || {};
  const allSpecialMonthlyData = JSON.parse(localStorage.getItem('specialMonthlyClients')) || {};
  
  const regularClients = allMonthlyData[monthKey] || [];
  const specialClients = allSpecialMonthlyData[monthKey] || [];
  const totalClients = regularClients.length + specialClients.length;
  
  // ডেইলি পেমেন্ট ডেটা গণনা করুন
  const year = parseInt(monthKey.split('-')[0]);
  const month = parseInt(monthKey.split('-')[1]) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let totalPayments = 0;
  let totalCollection = 0;
  let paymentDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const dateKey = `${monthKey}-${dayStr}`;
    const paymentKey = `payment-${dateKey}`;
    const paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];
    
    if (paymentData.length > 0) {
      paymentDays++;
      paymentData.forEach(payment => {
        totalPayments++;
        totalCollection += Number(payment.amount) || 0;
      });
    }
  }
  
  // প্রিভিউ কনটেন্ট তৈরি করুন
  previewContent.innerHTML = `
    <div class="preview-stats">
      <div class="preview-stat">
        <div class="label">Total Clients</div>
        <div class="value">${totalClients}</div>
      </div>
      <div class="preview-stat">
        <div class="label">Payment Days</div>
        <div class="value">${paymentDays}</div>
      </div>
      <div class="preview-stat">
        <div class="label">Total Payments</div>
        <div class="value">${totalPayments}</div>
      </div>
      <div class="preview-stat">
        <div class="label">Total Collection</div>
        <div class="value">₹${totalCollection}</div>
      </div>
    </div>
    
    <div class="preview-details">
      <h5><i class="fa-solid fa-users"></i> Client List</h5>
      <ul>
        ${regularClients.slice(0, 5).map(client => `
          <li>
            <span class="client-name">${client.name}</span>
            <span class="client-amount">₹${client.amount}</span>
          </li>
        `).join('')}
        
        ${specialClients.slice(0, 3).map(client => `
          <li style="border-left: 3px solid #8b5cf6;">
            <span class="client-name">${client.name} <small style="color: #8b5cf6;">(Monthly)</small></span>
            <span class="client-amount">₹${client.amount}</span>
          </li>
        `).join('')}
        
        ${(regularClients.length > 5 || specialClients.length > 3) ? `
          <li style="color: var(--text-light); font-style: italic; justify-content: center;">
            + ${Math.max(0, regularClients.length - 5) + Math.max(0, specialClients.length - 3)} more clients
          </li>
        ` : ''}
      </ul>
    </div>
  `;
  
  exportPreview.classList.add('show');
}

function hideExportPreview() {
  exportPreview.classList.remove('show');
}

// মেসেজ দেখান
function showTransferMessage(message, type = 'info') {
  transferInfo.innerHTML = '';
  transferInfo.className = `transfer-info ${type}`;
  
  const icons = {
    'success': 'fa-circle-check',
    'error': 'fa-circle-xmark',
    'warning': 'fa-triangle-exclamation',
    'info': 'fa-circle-info'
  };
  
  transferInfo.innerHTML = `
    <i class="fa-solid ${icons[type]}"></i>
    ${message}
  `;
}

// নির্বাচিত মাসের ডেটা সংগ্রহ করুন
function collectMonthDataForExport() {
  const selectedMonth = exportMonthSelect.value;
  const selectedYear = exportYearSelect.value;
  const monthKey = `${selectedYear}-${selectedMonth}`;
  
  const exportData = {
    version: '1.1',
    exportDate: new Date().toISOString(),
    source: 'LIC Collection System',
    month: monthKey,
    
    // Regular monthly clients
    monthlyClients: {},
    
    // Special monthly clients
    specialMonthlyClients: {},
    
    // Daily status records
    dailyStatus: {},
    
    // Daily payment records
    dailyPayments: {},
    
    // Metadata
    metadata: {
      totalClients: 0,
      totalCollection: 0,
      paymentDays: 0
    }
  };
  
  // Get all data but only for selected month
  const allMonthlyData = JSON.parse(localStorage.getItem('monthlyClients')) || {};
  const allSpecialMonthlyData = JSON.parse(localStorage.getItem('specialMonthlyClients')) || {};
  
  if (allMonthlyData[monthKey]) {
    exportData.monthlyClients[monthKey] = allMonthlyData[monthKey];
    exportData.metadata.totalClients += allMonthlyData[monthKey].length;
  }
  
  if (allSpecialMonthlyData[monthKey]) {
    exportData.specialMonthlyClients[monthKey] = allSpecialMonthlyData[monthKey];
    exportData.metadata.totalClients += allSpecialMonthlyData[monthKey].length;
  }
  
  // Get all days in the selected month
  const year = parseInt(selectedYear);
  const month = parseInt(selectedMonth) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Collect daily data for the entire month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const dateKey = `${monthKey}-${dayStr}`;
    
    // Daily status
    const dailyStatusKey = `dailyStatus-${dateKey}`;
    const statusData = JSON.parse(localStorage.getItem(dailyStatusKey)) || [];
    if (statusData.length > 0) {
      exportData.dailyStatus[dateKey] = statusData;
    }
    
    // Daily payments
    const paymentKey = `payment-${dateKey}`;
    const paymentData = JSON.parse(localStorage.getItem(paymentKey)) || [];
    if (paymentData.length > 0) {
      exportData.dailyPayments[dateKey] = paymentData;
      exportData.metadata.paymentDays++;
      
      // Calculate total collection
      paymentData.forEach(payment => {
        exportData.metadata.totalCollection += Number(payment.amount) || 0;
      });
    }
  }
  
  return exportData;
}

// ডেটা Export করুন
function exportMonthData() {
  try {
    const selectedMonth = exportMonthSelect.value;
    const selectedYear = exportYearSelect.value;
    const monthKey = `${selectedYear}-${selectedMonth}`;
    
    // Export বাটন লোডিং স্টেটে রাখুন
    exportBtn.innerHTML = '<i class="fa-solid fa-spinner loading-spinner"></i> Exporting...';
    exportBtn.disabled = true;
    
    const exportData = collectMonthDataForExport();
    
    // ডেটা আছে কিনা চেক করুন
    const hasData = exportData.metadata.totalClients > 0 || 
                    Object.keys(exportData.dailyPayments).length > 0;
    
    if (!hasData) {
      showTransferMessage('No data found for the selected month', 'warning');
      exportBtn.innerHTML = '<i class="fa-solid fa-file-export"></i> Export Selected Month';
      exportBtn.disabled = false;
      return;
    }
    
    // JSON স্ট্রিং তৈরি করুন
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // ফাইল ডাউনলোড করুন
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lic-collection-${monthKey}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // সফলতা মেসেজ
    const monthName = monthNames[selectedMonth];
    showTransferMessage(
      `Successfully exported data for ${monthName} ${selectedYear}! 
      ${exportData.metadata.totalClients} clients, 
      ${exportData.metadata.paymentDays} payment days, 
      Total: ₹${exportData.metadata.totalCollection}`, 
      'success'
    );
    
  } catch (error) {
    console.error('Export error:', error);
    showTransferMessage(`Export failed: ${error.message}`, 'error');
  } finally {
    // বাটন রিসেট করুন
    exportBtn.innerHTML = '<i class="fa-solid fa-file-export"></i> Export Selected Month';
    exportBtn.disabled = false;
  }
}

// ডেটা Import করুন
async function importMonthData() {
  if (!importFileInput.files[0]) {
    showTransferMessage('Please select a JSON file first', 'warning');
    return;
  }
  
  const file = importFileInput.files[0];
  
  try {
    importBtn.innerHTML = '<i class="fa-solid fa-spinner loading-spinner"></i> Importing...';
    importBtn.disabled = true;
    
    const fileContent = await file.text();
    const importData = JSON.parse(fileContent);
    
    // ডেটা ভ্যালিডেট করুন
    if (!importData.version || !importData.month) {
      throw new Error('Invalid file format. Please select a valid LIC Collection export file.');
    }
    
    const importMonth = importData.month;
    const [importYear, importMonthNum] = importMonth.split('-');
    const importMonthName = monthNames[importMonthNum];
    
    // Import প্রিভিউ দেখান
    const clientCount = (importData.monthlyClients[importMonth] || []).length + 
                       (importData.specialMonthlyClients[importMonth] || []).length;
    const paymentDays = Object.keys(importData.dailyPayments || {}).length;
    
    const confirmationMessage = `
Import Details:
• Month: ${importMonthName} ${importYear}
• Clients: ${clientCount}
• Payment Records: ${paymentDays} days
• Export Date: ${new Date(importData.exportDate).toLocaleDateString('en-IN')}

WARNING: This will overwrite existing data for ${importMonthName} ${importYear}.
Do you want to continue?
    `;
    
    if (!confirm(confirmationMessage.trim())) {
      throw new Error('Import cancelled by user');
    }
    
    // Import লজিক
    // 1. Monthly Clients
    const allMonthlyData = JSON.parse(localStorage.getItem('monthlyClients')) || {};
    allMonthlyData[importMonth] = importData.monthlyClients[importMonth] || [];
    localStorage.setItem('monthlyClients', JSON.stringify(allMonthlyData));
    
    // 2. Special Monthly Clients
    const allSpecialMonthlyData = JSON.parse(localStorage.getItem('specialMonthlyClients')) || {};
    allSpecialMonthlyData[importMonth] = importData.specialMonthlyClients[importMonth] || [];
    localStorage.setItem('specialMonthlyClients', JSON.stringify(allSpecialMonthlyData));
    
    // 3. Daily Status
    Object.entries(importData.dailyStatus || {}).forEach(([dateKey, statusArray]) => {
      localStorage.setItem(`dailyStatus-${dateKey}`, JSON.stringify(statusArray));
    });
    
    // 4. Daily Payments
    Object.entries(importData.dailyPayments || {}).forEach(([dateKey, paymentsArray]) => {
      localStorage.setItem(`payment-${dateKey}`, JSON.stringify(paymentsArray));
    });
    
    // 5. Today's collection update
    if (importData.metadata && importData.metadata.totalCollection > 0) {
      // Find if this month has today's date
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = (today.getMonth() + 1).toString().padStart(2, '0');
      const todayMonthKey = `${todayYear}-${todayMonth}`;
      
      if (todayMonthKey === importMonth) {
        const todayDay = today.getDate().toString().padStart(2, '0');
        const todayKey = `${importMonth}-${todayDay}`;
        const todayPayments = importData.dailyPayments[todayKey] || [];
        const todayTotal = todayPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        
        if (todayTotal > 0) {
          localStorage.setItem('todayCollectionAmount', todayTotal.toString());
        }
      }
    }
    
    // সফলতা মেসেজ
    showTransferMessage(
      `Successfully imported data for ${importMonthName} ${importYear}! 
      ${clientCount} clients and ${paymentDays} payment days imported.`, 
      'success'
    );
    
    // পেজ রিফ্রেশ করুন (বিলম্বিত)
    setTimeout(() => {
      location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('Import error:', error);
    showTransferMessage(`Import failed: ${error.message}`, 'error');
  } finally {
    importBtn.innerHTML = '<i class="fa-solid fa-file-import"></i> Import Month Data';
    importBtn.disabled = false;
    importFileInput.value = '';
    fileName.textContent = 'No file chosen';
  }
}

// ফাইল নির্বাচন ইভেন্ট
importFileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    fileName.textContent = file.name;
    fileName.style.color = 'var(--primary)';
    fileName.style.fontWeight = '600';
    
    // ফাইল পড়ে প্রিভিউ দেখান (অপশনাল)
    if (file.size < 1024 * 1024) { // 1MB এর কম
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const previewData = JSON.parse(e.target.result);
          if (previewData.month) {
            const [importYear, importMonthNum] = previewData.month.split('-');
            const importMonthName = monthNames[importMonthNum];
            showTransferMessage(
              `Ready to import data for ${importMonthName} ${importYear}`, 
              'info'
            );
          }
        } catch (err) {
          // JSON পার্সিং ত্রুটি উপেক্ষা করুন
        }
      };
      reader.readAsText(file);
    }
  } else {
    fileName.textContent = 'No file chosen';
    fileName.style.color = 'var(--text-light)';
    fileName.style.fontWeight = 'normal';
  }
});

// ইভেন্ট লিসেনার যোগ করুন
document.addEventListener('DOMContentLoaded', () => {
  // বছর ড্রপডাউন পপুলেট করুন
  populateYearDropdown();
  
  // নির্বাচিত মাস পরিবর্তনে ইভেন্ট
  exportMonthSelect.addEventListener('change', updateSelectedMonthDisplay);
  exportYearSelect.addEventListener('change', updateSelectedMonthDisplay);
  
  // Export বাটন
  exportBtn.addEventListener('click', exportMonthData);
  
  // Import বাটন
  importBtn.addEventListener('click', importMonthData);
  
  // বর্তমান মাসের ডেটা চেক করুন
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = currentDate.getFullYear();
  
  exportMonthSelect.value = currentMonth;
  exportYearSelect.value = currentYear;
  updateSelectedMonthDisplay();
});