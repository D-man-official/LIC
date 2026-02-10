// ===================== COMPLETE premium.js WITH MONTH NAVIGATION, TOAST NOTIFICATIONS & SUM TOTAL =====================
document.addEventListener("DOMContentLoaded", () => {
  /* ===================== CONSTANTS ===================== */
  const PREMIUM_ENTRIES_BY_MONTH_KEY = "premiumEntriesByMonth";
  const MASTER_CLIENTS_KEY = "clients";
  
  /* ===================== ELEMENTS ===================== */
  const premiumTotalEntries = document.getElementById("premiumTotalEntries");
  const totalClients = document.getElementById("totalClients");
  const submittedCount = document.getElementById("submittedCount");
  const pendingCount = document.getElementById("pendingCount");
  const clientSelect = document.getElementById("clientSelect");
  const addClientBtn = document.getElementById("addClientBtn");
  const premiumTableBody = document.getElementById("premiumTableBody");
  const noPremiumData = document.getElementById("noPremiumData");
  const showingCount = document.getElementById("showingCount");
  const totalCount = document.getElementById("totalCount");
  const submittedTotal = document.getElementById("submittedTotal");
  const pendingTotal = document.getElementById("pendingTotal");
  
  /* ===================== MONTH NAVIGATION ELEMENTS ===================== */
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const currentMonthBtn = document.getElementById("currentMonthBtn");
  const currentMonthDisplay = document.getElementById("currentMonthDisplay");
  
  /* ===================== GLOBAL VARIABLES ===================== */
  let allPremiumEntries = [];
  let filteredEntries = [];
  let currentFilter = 'all';
  let currentViewDate = new Date();
  let currentMonthKey = getMonthKey(currentViewDate);
  let runningTotal = 0;
  
  /* ===================== HELPER FUNCTIONS ===================== */
  function getMonthKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  
  function formatMonthDisplay(date) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  }
  
  function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
  
  function updateMonthDisplay() {
    currentMonthDisplay.textContent = formatMonthDisplay(currentViewDate);
    
    const now = new Date();
    const isCurrentMonth = 
      currentViewDate.getMonth() === now.getMonth() && 
      currentViewDate.getFullYear() === now.getFullYear();
    
    currentMonthBtn.classList.toggle("active", isCurrentMonth);
  }
  
  function calculateRunningTotal() {
    runningTotal = 0;
    filteredEntries.forEach((entry, index) => {
      const premium = parseFloat(entry.premiumAmount) || 0;
      runningTotal += premium;
    });
    return runningTotal;
  }
  
  /* ===================== TOAST NOTIFICATION SYSTEM ===================== */
  window.showToast = function(message, type = 'success', duration = 3000) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass, iconText;
    switch(type) {
      case 'success':
        iconClass = 'fa-circle-check';
        iconText = 'Success';
        break;
      case 'warning':
        iconClass = 'fa-triangle-exclamation';
        iconText = 'Warning';
        break;
      case 'error':
        iconClass = 'fa-circle-xmark';
        iconText = 'Error';
        break;
      case 'info':
        iconClass = 'fa-circle-info';
        iconText = 'Info';
        break;
      default:
        iconClass = 'fa-circle-check';
        iconText = 'Success';
    }
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fa-solid ${iconClass}"></i>
      </div>
      <div class="toast-content">
        <h4>${iconText}</h4>
        <p>${message}</p>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="fa-solid fa-times"></i>
      </button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
      }
    }, duration);
    
    return toast;
  };

  /* ===================== ANIMATION FUNCTIONS ===================== */
  window.animateElement = function(elementId, animationClass = 'pulse-animation') {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add(animationClass);
      setTimeout(() => {
        element.classList.remove(animationClass);
      }, 1500);
    }
  };

  function animateRow(rowElement, color = 'rgba(34, 197, 94, 0.15)') {
    if (!rowElement) return;
    
    rowElement.style.backgroundColor = color;
    rowElement.style.transition = 'background-color 0.5s ease';
    
    const avatar = rowElement.querySelector('.client-avatar-small');
    if (avatar) {
      avatar.classList.add('pulse-animation');
    }
    
    setTimeout(() => {
      rowElement.style.backgroundColor = '';
      if (avatar) avatar.classList.remove('pulse-animation');
    }, 2000);
  }
  
  /* ===================== INITIALIZATION ===================== */
  function init() {
    updateMonthDisplay();
    loadMasterClients();
    loadPremiumData();
    updateStatistics();
    renderTable();
    
    addClientBtn.addEventListener("click", addClientToTracker);
    prevMonthBtn.addEventListener("click", goToPrevMonth);
    nextMonthBtn.addEventListener("click", goToNextMonth);
    currentMonthBtn.addEventListener("click", goToCurrentMonth);
    
    setInterval(refreshAllData, 30000);
  }
  
  /* ===================== MONTH NAVIGATION FUNCTIONS ===================== */
  function goToPrevMonth() {
    currentViewDate.setMonth(currentViewDate.getMonth() - 1);
    currentMonthKey = getMonthKey(currentViewDate);
    updateMonthDisplay();
    showToast(`Switched to ${formatMonthDisplay(currentViewDate)}`, 'info');
    refreshAllData();
  }
  
  function goToNextMonth() {
    currentViewDate.setMonth(currentViewDate.getMonth() + 1);
    currentMonthKey = getMonthKey(currentViewDate);
    updateMonthDisplay();
    showToast(`Switched to ${formatMonthDisplay(currentViewDate)}`, 'info');
    refreshAllData();
  }
  
  function goToCurrentMonth() {
    currentViewDate = new Date();
    currentMonthKey = getMonthKey(currentViewDate);
    updateMonthDisplay();
    showToast(`Switched to current month`, 'info');
    refreshAllData();
  }
  
  /* ===================== LOAD MASTER CLIENTS FOR DROPDOWN ===================== */
  function loadMasterClients() {
    const masterClients = getMasterClients();
    
    clientSelect.innerHTML = '<option value="">Select a client to add...</option>';
    
    if (masterClients.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No clients found in database";
      option.disabled = true;
      clientSelect.appendChild(option);
      return;
    }
    
    const existingPremiumSLs = allPremiumEntries.map(entry => entry.sl);
    const sortedClients = masterClients.sort((a, b) => Number(a.sl) - Number(b.sl));
    
    sortedClients.forEach(client => {
      if (!existingPremiumSLs.includes(parseInt(client.sl))) {
        const option = document.createElement("option");
        option.value = client.sl;
        const name = client.name && client.name !== "-" ? client.name : "Unnamed Client";
        const premium = client.premium && client.premium !== "-" ? client.premium : "0";
        option.textContent = `SL ${client.sl} - ${name} (₹${premium})`;
        option.title = `Policy: ${client.policyNo || "-"} | DOC: ${client.doc || "-"}`;
        clientSelect.appendChild(option);
      }
    });
    
    if (clientSelect.options.length === 1 && clientSelect.options[0].disabled) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "All clients already in this month's tracker";
      option.disabled = true;
      clientSelect.appendChild(option);
    }
  }
  
  /* ===================== GET FRESH MASTER CLIENTS ===================== */
  function getMasterClients() {
    try {
      const rawData = localStorage.getItem(MASTER_CLIENTS_KEY);
      if (!rawData) return [];
      
      const clients = JSON.parse(rawData);
      return clients.filter(client => 
        client && (
          client.sl || 
          (client.name && client.name !== "-") || 
          (client.policyNo && client.policyNo !== "-")
        )
      );
    } catch (error) {
      console.error("Error loading master clients:", error);
      return [];
    }
  }
  
  /* ===================== LOAD PREMIUM DATA (FOR CURRENT MONTH) ===================== */
  function loadPremiumData() {
    const allMonthsData = JSON.parse(localStorage.getItem(PREMIUM_ENTRIES_BY_MONTH_KEY)) || {};
    allPremiumEntries = allMonthsData[currentMonthKey] || [];
    filteredEntries = [...allPremiumEntries];
    
    allPremiumEntries.sort((a, b) => Number(a.sl) - Number(b.sl));
    filteredEntries.sort((a, b) => Number(a.sl) - Number(b.sl));
    
    const entryCount = allPremiumEntries.length;
    premiumTotalEntries.textContent = `${entryCount} ${entryCount === 1 ? 'Entry' : 'Entries'}`;
    totalCount.textContent = entryCount;
    showingCount.textContent = entryCount;
  }
  
  /* ===================== SAVE PREMIUM DATA (FOR CURRENT MONTH) ===================== */
  function savePremiumData() {
    const allMonthsData = JSON.parse(localStorage.getItem(PREMIUM_ENTRIES_BY_MONTH_KEY)) || {};
    allMonthsData[currentMonthKey] = allPremiumEntries;
    localStorage.setItem(PREMIUM_ENTRIES_BY_MONTH_KEY, JSON.stringify(allMonthsData));
  }
  
  /* ===================== SYNC WITH MASTER LIST ===================== */
  function syncWithMasterList() {
    const masterClients = getMasterClients();
    const masterClientSLs = masterClients.map(client => parseInt(client.sl));
    
    let removedCount = 0;
    const updatedPremiumEntries = allPremiumEntries.filter(premiumEntry => {
      const existsInMaster = masterClientSLs.includes(parseInt(premiumEntry.sl));
      if (!existsInMaster) {
        removedCount++;
      }
      return existsInMaster;
    });
    
    if (removedCount > 0) {
      allPremiumEntries = updatedPremiumEntries;
      savePremiumData();
      loadPremiumData();
      renderTable();
      showToast(`Synced: Removed ${removedCount} premium entries`, 'info');
    }
  }
  
  /* ===================== UPDATE STATISTICS ===================== */
  function updateStatistics() {
    const masterClients = getMasterClients();
    const totalMasterClients = masterClients.length;
    totalClients.textContent = totalMasterClients;
    
    const submitted = allPremiumEntries.filter(entry => entry.status === 'submitted').length;
    const pending = allPremiumEntries.filter(entry => entry.status === 'pending').length;
    
    submittedCount.textContent = submitted;
    pendingCount.textContent = pending;
    
    const premiumCount = allPremiumEntries.length;
    premiumTotalEntries.textContent = `${premiumCount} ${premiumCount === 1 ? 'Entry' : 'Entries'}`;
    
    // Update total amounts
    const submittedPremium = allPremiumEntries
      .filter(entry => entry.status === 'submitted')
      .reduce((sum, entry) => sum + (parseFloat(entry.premiumAmount) || 0), 0);
    
    const pendingPremium = allPremiumEntries
      .filter(entry => entry.status === 'pending')
      .reduce((sum, entry) => sum + (parseFloat(entry.premiumAmount) || 0), 0);
    
    if (submittedTotal) submittedTotal.textContent = formatCurrency(submittedPremium);
    if (pendingTotal) pendingTotal.textContent = formatCurrency(pendingPremium);
  }
  
  /* ===================== ADD CLIENT TO TRACKER ===================== */
  function addClientToTracker() {
    const selectedValue = clientSelect.value;
    if (!selectedValue) {
      showToast("Please select a client first!", 'warning');
      clientSelect.classList.add('pulse-animation');
      setTimeout(() => clientSelect.classList.remove('pulse-animation'), 1000);
      return;
    }
    
    const masterClients = getMasterClients();
    const selectedClient = masterClients.find(client => 
      parseInt(client.sl) === parseInt(selectedValue)
    );
    
    if (!selectedClient) {
      showToast("Client not found in master database!", 'error');
      loadMasterClients();
      return;
    }
    
    const alreadyExists = allPremiumEntries.some(entry => 
      parseInt(entry.sl) === parseInt(selectedClient.sl)
    );
    
    if (alreadyExists) {
      showToast(`This client is already in ${formatMonthDisplay(currentViewDate)} tracker!`, 'warning');
      return;
    }
    
    const clientName = selectedClient.name && selectedClient.name !== "-" ? 
                      selectedClient.name : "Unnamed Client";
    const clientPremium = selectedClient.premium && selectedClient.premium !== "-" ? 
                         selectedClient.premium : "0";
    const clientPolicy = selectedClient.policyNo && selectedClient.policyNo !== "-" ? 
                        selectedClient.policyNo : "-";
    const clientTableNo = selectedClient.tableNo && selectedClient.tableNo !== "-" ? 
                         selectedClient.tableNo : "-";
    
    const newEntry = {
      id: Date.now(),
      sl: parseInt(selectedClient.sl),
      name: clientName,
      premiumAmount: clientPremium,
      paymentMethod: '',
      dateSubmitted: '',
      status: 'pending',
      policyNo: clientPolicy,
      tableNo: clientTableNo,
      premiumType: selectedClient.premiumType || '-',
      sumAssured: selectedClient.sumAsset || '-',
      doc: selectedClient.doc || '-',
      addedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      monthYear: currentMonthKey,
      isAmountModified: false,
      requiresResubmit: false
    };
    
    allPremiumEntries.push(newEntry);
    savePremiumData();
    refreshAllData();
    
    showToast(
      `Client ${clientName} (SL ${selectedClient.sl}) added to ${formatMonthDisplay(currentViewDate)} tracker!`,
      'success',
      4000
    );
    
    setTimeout(() => {
      const newRow = document.querySelector(`[data-sl="${selectedClient.sl}"]`);
      if (newRow) {
        newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        animateRow(newRow, 'rgba(34, 197, 94, 0.15)');
      }
    }, 500);
    
    animateElement('premiumTotalEntries');
  }
  
  /* ===================== RENDER TABLE ===================== */
  function renderTable() {
    premiumTableBody.innerHTML = '';
    
    if (filteredEntries.length === 0) {
      noPremiumData.style.display = 'flex';
      return;
    }
    
    noPremiumData.style.display = 'none';
    
    let cumulativeTotal = 0;
    
    filteredEntries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.setAttribute('data-sl', entry.sl);
      row.setAttribute('data-id', entry.id);
      
      const masterClients = getMasterClients();
      const masterClient = masterClients.find(c => parseInt(c.sl) === parseInt(entry.sl));
      
      if (masterClient) {
        const masterName = masterClient.name && masterClient.name !== "-" ? 
                          masterClient.name : "Unnamed Client";
        if (entry.name !== masterName) {
          entry.name = masterName;
        }
        
        const masterPremium = masterClient.premium && masterClient.premium !== "-" ? 
                             masterClient.premium : "0";
        if (entry.premiumAmount !== masterPremium) {
          entry.premiumAmount = masterPremium;
        }
      }
      
      const premiumAmount = parseFloat(entry.premiumAmount) || 0;
      cumulativeTotal += premiumAmount;
      
      // Check if entry is ready for submission
      const canSubmit = entry.premiumAmount && entry.premiumAmount !== "0" && 
                       entry.paymentMethod && entry.dateSubmitted;
      
      // Determine button text and icon
      let submitButtonText, submitButtonIcon, submitButtonTitle;
      if (entry.status === 'pending') {
        if (entry.requiresResubmit) {
          submitButtonText = 'Resubmit';
          submitButtonIcon = 'fa-rotate-right';
          submitButtonTitle = 'Amount changed - Resubmit required';
        } else {
          submitButtonText = 'Submit';
          submitButtonIcon = 'fa-paper-plane';
          submitButtonTitle = canSubmit ? 'Submit Premium' : 'Fill all fields first';
        }
      } else {
        submitButtonText = 'Submitted';
        submitButtonIcon = 'fa-check';
        submitButtonTitle = 'Premium submitted';
      }
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="client-avatar-small">${entry.name.charAt(0)}</div>
            <div>
              <strong>${entry.name}</strong>
              <div style="font-size: 0.8rem; color: #64748b;">
                SL: ${entry.sl} | Policy: ${entry.policyNo}
                ${entry.tableNo && entry.tableNo !== "-" ? `| Table: ${entry.tableNo}` : ""}
              </div>
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 5px;">
            <input type="number" 
                   class="premium-input" 
                   value="${entry.premiumAmount}" 
                   onchange="handleAmountChange(${entry.id}, this.value)"
                   onblur="handleAmountBlur(${entry.id}, this.value)"
                   placeholder="Amount"
                   style="font-weight: 600; color: ${entry.requiresResubmit ? '#f59e0b' : '#059669'}; min-width: 100px;">
            ${entry.isAmountModified ? '<span style="color: #f59e0b; font-size: 0.8rem;" title="Amount modified"><i class="fa-solid fa-pen"></i></span>' : ''}
          </div>
        </td>
        <td>
          <select class="premium-select" onchange="updatePaymentMethod(${entry.id}, this.value)" 
                  style="min-width: 140px;">
            <option value="">Select Method</option>
            <option value="Cash" ${entry.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
            <option value="Bank Transfer" ${entry.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
            <option value="Cheque" ${entry.paymentMethod === 'Cheque' ? 'selected' : ''}>Cheque</option>
            <option value="UPI" ${entry.paymentMethod === 'UPI' ? 'selected' : ''}>UPI</option>
            <option value="Auto Debit" ${entry.paymentMethod === 'Auto Debit' ? 'selected' : ''}>Auto Debit</option>
          </select>
        </td>
        <td>
          <input type="date" 
                 class="premium-input" 
                 value="${entry.dateSubmitted}"
                 onchange="updateDateSubmitted(${entry.id}, this.value)"
                 style="min-width: 130px;">
        </td>
        <td>
          <div class="sum-total-cell sum-total-updated">
            ${formatCurrency(cumulativeTotal)}
            <span class="running-total">Running: ${formatCurrency(premiumAmount)}</span>
          </div>
        </td>
        <td>
          <span class="status-badge status-${entry.status}">
            ${entry.status === 'submitted' ? 'Submitted' : 'Pending'}
            ${entry.requiresResubmit ? ' <i class="fa-solid fa-exclamation" style="margin-left: 5px;"></i>' : ''}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn mark-submitted ${entry.status === 'submitted' && !entry.requiresResubmit ? 'submitted' : ''} ${canSubmit && !entry.requiresResubmit ? '' : 'disabled'}" 
                    onclick="submitPremiumEntry(${entry.id})" 
                    title="${submitButtonTitle}"
                    ${(entry.status === 'submitted' && !entry.requiresResubmit) || !canSubmit ? 'disabled' : ''}>
              <i class="fa-solid ${submitButtonIcon}"></i>
            </button>
            <button class="action-btn print-btn" onclick="printPremiumRow(${entry.id})" title="Print Receipt">
              <i class="fa-solid fa-print"></i>
            </button>
            <button class="delete-btn" onclick="deletePremiumEntry(${entry.id})" title="Remove">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      
      premiumTableBody.appendChild(row);
      
      setTimeout(() => {
        const sumTotalCell = row.querySelector('.sum-total-cell');
        if (sumTotalCell) {
          sumTotalCell.classList.remove('sum-total-updated');
        }
      }, 500);
    });
    
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
      <td colspan="5" style="text-align: right; padding-right: 20px; font-weight: 700;">
        <i class="fa-solid fa-calculator" style="margin-right: 8px;"></i>
        Total Premium Amount (${filteredEntries.length} entries):
      </td>
      <td>
        <div class="sum-total-cell" style="background: rgba(16, 185, 129, 0.2); color: #065f46;">
          ${formatCurrency(cumulativeTotal)}
        </div>
      </td>
      <td colspan="2"></td>
    `;
    premiumTableBody.appendChild(totalRow);
    
    showingCount.textContent = filteredEntries.length;
    updateTotalCalculation();
  }
  
  /* ===================== UPDATE TOTAL CALCULATION ===================== */
  function updateTotalCalculation() {
    const totalPremium = allPremiumEntries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.premiumAmount) || 0);
    }, 0);
    
    const submittedPremium = allPremiumEntries
      .filter(entry => entry.status === 'submitted' && !entry.requiresResubmit)
      .reduce((sum, entry) => {
        return sum + (parseFloat(entry.premiumAmount) || 0);
      }, 0);
    
    const pendingPremium = allPremiumEntries
      .filter(entry => entry.status === 'pending' || entry.requiresResubmit)
      .reduce((sum, entry) => {
        return sum + (parseFloat(entry.premiumAmount) || 0);
      }, 0);
    
    const statsElement = document.querySelector('.stats-section');
    if (statsElement) {
      const totalClientsElement = statsElement.querySelector('#totalClients');
      const submittedElement = statsElement.querySelector('#submittedCount');
      const pendingElement = statsElement.querySelector('#pendingCount');
      
      if (totalClientsElement) {
        totalClientsElement.innerHTML = `${allPremiumEntries.length}<br><span style="font-size: 0.7rem; color: #64748b;">Total: ${formatCurrency(totalPremium)}</span>`;
      }
      
      if (submittedElement) {
        submittedElement.innerHTML = `${allPremiumEntries.filter(e => e.status === 'submitted' && !e.requiresResubmit).length}<br><span style="font-size: 0.7rem; color: #10b981;">Amount: ${formatCurrency(submittedPremium)}</span>`;
      }
      
      if (pendingElement) {
        pendingElement.innerHTML = `${allPremiumEntries.filter(e => e.status === 'pending' || e.requiresResubmit).length}<br><span style="font-size: 0.7rem; color: #ef4444;">Amount: ${formatCurrency(pendingPremium)}</span>`;
      }
    }
    
    if (submittedTotal) submittedTotal.textContent = formatCurrency(submittedPremium);
    if (pendingTotal) pendingTotal.textContent = formatCurrency(pendingPremium);
  }
  
  /* ===================== FILTER FUNCTIONS ===================== */
  window.filterData = function(filterType) {
    currentFilter = filterType;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    switch(filterType) {
      case 'submitted':
        filteredEntries = allPremiumEntries.filter(entry => entry.status === 'submitted' && !entry.requiresResubmit);
        break;
      case 'pending':
        filteredEntries = allPremiumEntries.filter(entry => entry.status === 'pending' || entry.requiresResubmit);
        break;
      default:
        filteredEntries = [...allPremiumEntries];
    }
    
    renderTable();
    showToast(`Showing ${filteredEntries.length} ${filterType} entries`, 'info', 1500);
  };
  
  /* ===================== AMOUNT CHANGE HANDLERS ===================== */
  window.handleAmountChange = function(id, newAmount) {
    const entryIndex = allPremiumEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;
    
    const oldAmount = allPremiumEntries[entryIndex].premiumAmount;
    
    if (newAmount !== oldAmount) {
      allPremiumEntries[entryIndex].premiumAmount = newAmount;
      allPremiumEntries[entryIndex].isAmountModified = true;
      allPremiumEntries[entryIndex].lastUpdated = new Date().toISOString();
      
      // If entry was already submitted, mark it as requiring resubmit
      if (allPremiumEntries[entryIndex].status === 'submitted') {
        allPremiumEntries[entryIndex].requiresResubmit = true;
        allPremiumEntries[entryIndex].status = 'pending'; // Temporarily mark as pending until resubmitted
        showToast(`Amount changed for ${allPremiumEntries[entryIndex].name}. Please resubmit!`, 'warning', 3000);
      }
      
      savePremiumData();
      updateStatistics();
      updateTotalCalculation();
      
      const row = document.querySelector(`[data-id="${id}"]`);
      if (row) animateRow(row, 'rgba(59, 130, 246, 0.1)');
      
      showToast(`Premium amount updated to ₹${newAmount}`, 'success', 2000);
      
      // Re-render to update button states
      if (currentFilter === 'all') renderTable();
      else window.filterData(currentFilter);
    }
  };
  
  window.handleAmountBlur = function(id, amount) {
    // Just update the amount without triggering resubmit logic
    const entryIndex = allPremiumEntries.findIndex(entry => entry.id === id);
    if (entryIndex !== -1 && amount !== allPremiumEntries[entryIndex].premiumAmount) {
      allPremiumEntries[entryIndex].premiumAmount = amount;
      allPremiumEntries[entryIndex].lastUpdated = new Date().toISOString();
      savePremiumData();
    }
  };
  
  window.updatePaymentMethod = function(id, method) {
    const entryIndex = allPremiumEntries.findIndex(entry => entry.id === id);
    if (entryIndex !== -1) {
      allPremiumEntries[entryIndex].paymentMethod = method;
      allPremiumEntries[entryIndex].lastUpdated = new Date().toISOString();
      savePremiumData();
      
      const row = document.querySelector(`[data-id="${id}"]`);
      if (row) animateRow(row, 'rgba(139, 92, 246, 0.1)');
      
      if (method) {
        showToast(`Payment method set to ${method}`, 'info', 2000);
      }
      
      if (currentFilter === 'all') renderTable();
      else window.filterData(currentFilter);
    }
  };
  
  window.updateDateSubmitted = function(id, date) {
    const entryIndex = allPremiumEntries.findIndex(entry => entry.id === id);
    if (entryIndex !== -1) {
      allPremiumEntries[entryIndex].dateSubmitted = date;
      allPremiumEntries[entryIndex].lastUpdated = new Date().toISOString();
      
      savePremiumData();
      
      const row = document.querySelector(`[data-id="${id}"]`);
      if (row) animateRow(row, 'rgba(16, 185, 129, 0.1)');
      
      if (currentFilter === 'all') renderTable();
    }
  };
  
  /* ===================== SUBMIT PREMIUM ENTRY ===================== */
  window.submitPremiumEntry = function(id) {
    const entryIndex = allPremiumEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;
    
    const entry = allPremiumEntries[entryIndex];
    
    // Check if all required fields are filled
    if (!entry.premiumAmount || entry.premiumAmount === "0") {
      showToast("Please enter premium amount first!", 'warning');
      return;
    }
    
    if (!entry.paymentMethod) {
      showToast("Please select payment method!", 'warning');
      return;
    }
    
    if (!entry.dateSubmitted) {
      showToast("Please select submission date!", 'warning');
      return;
    }
    
    // Update status to submitted
    allPremiumEntries[entryIndex].status = 'submitted';
    allPremiumEntries[entryIndex].requiresResubmit = false;
    allPremiumEntries[entryIndex].isAmountModified = false;
    
    // Set date if not already set
    if (!entry.dateSubmitted) {
      allPremiumEntries[entryIndex].dateSubmitted = new Date().toISOString().split('T')[0];
    }
    
    allPremiumEntries[entryIndex].lastUpdated = new Date().toISOString();
    savePremiumData();
    
    updateStatistics();
    updateTotalCalculation();
    
    // Show feedback
    const row = document.querySelector(`[data-id="${id}"]`);
    if (row) animateRow(row, 'rgba(16, 185, 129, 0.1)');
    
    let message = `Premium submitted for ${entry.name}!`;
    if (entry.isAmountModified) {
      message = `Premium updated and submitted for ${entry.name}!`;
    }
    
    showToast(message, 'success', 3000);
    
    if (currentFilter !== 'all') window.filterData(currentFilter);
    else renderTable();
  };
  
  /* ===================== PRINT FUNCTIONS ===================== */
  window.printPremiumRow = function(id) {
    const entryIndex = allPremiumEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;
    
    const entry = allPremiumEntries[entryIndex];
    
    // Create print content
    const printContent = `
      <html>
        <head>
          <title>LIC Premium Receipt - ${entry.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #2563eb; }
            .details { margin: 15px 0; }
            .detail-row { display: flex; margin: 8px 0; }
            .label { font-weight: bold; width: 150px; }
            .value { flex: 1; }
            .total { font-size: 1.2em; font-weight: bold; text-align: center; margin: 20px 0; padding: 10px; background: #f0f0f0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px dashed #000; font-size: 0.9em; color: #666; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
            .status.submitted { background: #d1fae5; color: #065f46; }
            .status.pending { background: #fef3c7; color: #92400e; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>LIC Premium Receipt</h1>
              <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <div class="details">
              <div class="detail-row">
                <div class="label">Client Name:</div>
                <div class="value">${entry.name}</div>
              </div>
              <div class="detail-row">
                <div class="label">Policy No:</div>
                <div class="value">${entry.policyNo}</div>
              </div>
              <div class="detail-row">
                <div class="label">SL No:</div>
                <div class="value">${entry.sl}</div>
              </div>
              <div class="detail-row">
                <div class="label">Premium Amount:</div>
                <div class="value">${formatCurrency(entry.premiumAmount)}</div>
              </div>
              <div class="detail-row">
                <div class="label">Payment Method:</div>
                <div class="value">${entry.paymentMethod || 'Not specified'}</div>
              </div>
              <div class="detail-row">
                <div class="label">Date Submitted:</div>
                <div class="value">${entry.dateSubmitted || 'Not submitted'}</div>
              </div>
              <div class="detail-row">
                <div class="label">Status:</div>
                <div class="value">
                  <span class="status ${entry.status} ${entry.requiresResubmit ? 'pending' : entry.status}">
                    ${entry.status === 'submitted' && !entry.requiresResubmit ? 'Submitted' : 'Pending'}
                    ${entry.requiresResubmit ? ' (Needs Resubmit)' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="total">
              Total Amount: ${formatCurrency(entry.premiumAmount)}
            </div>
            
            <div class="footer">
              <p>LIC Collection System</p>
              <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
              <p>Month: ${formatMonthDisplay(currentViewDate)}</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Receipt
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  /* ===================== PRINT ALL PREMIUM DATA ===================== */
  window.printAllPremiumData = function() {
    if (allPremiumEntries.length === 0) {
      showToast(`No premium data found for ${formatMonthDisplay(currentViewDate)}!`, 'warning');
      return;
    }
    
    // Calculate totals
    const totalPremium = allPremiumEntries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.premiumAmount) || 0);
    }, 0);
    
    const submittedPremium = allPremiumEntries
      .filter(entry => entry.status === 'submitted' && !entry.requiresResubmit)
      .reduce((sum, entry) => {
        return sum + (parseFloat(entry.premiumAmount) || 0);
      }, 0);
    
    const pendingPremium = allPremiumEntries
      .filter(entry => entry.status === 'pending' || entry.requiresResubmit)
      .reduce((sum, entry) => {
        return sum + (parseFloat(entry.premiumAmount) || 0);
      }, 0);
    
    // Create print content
    const printContent = `
      <html>
        <head>
          <title>LIC Premium Tracker - ${formatMonthDisplay(currentViewDate)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .report-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
            .report-header h1 { margin: 0; color: #2563eb; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 10px; }
            .summary-item { text-align: center; }
            .summary-value { font-size: 1.5em; font-weight: bold; }
            .summary-label { font-size: 0.9em; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status-submitted { background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; }
            .status-pending { background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; }
            .total-row { background-color: #e8f5e9; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px dashed #000; font-size: 0.9em; color: #666; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
              @page { margin: 20mm; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>LIC Premium Tracker - ${formatMonthDisplay(currentViewDate)}</h1>
            <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-value">${allPremiumEntries.length}</div>
              <div class="summary-label">Total Clients</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(totalPremium)}</div>
              <div class="summary-label">Total Premium</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(submittedPremium)}</div>
              <div class="summary-label">Submitted</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${formatCurrency(pendingPremium)}</div>
              <div class="summary-label">Pending</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Client Name</th>
                <th>Premium Amount</th>
                <th>Payment Method</th>
                <th>Date Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${allPremiumEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.name}</td>
                  <td>${formatCurrency(entry.premiumAmount)}</td>
                  <td>${entry.paymentMethod || '-'}</td>
                  <td>${entry.dateSubmitted || '-'}</td>
                  <td>
                    <span class="status-${entry.status} ${entry.requiresResubmit ? 'status-pending' : 'status-' + entry.status}">
                      ${entry.status === 'submitted' && !entry.requiresResubmit ? 'Submitted' : 'Pending'}
                      ${entry.requiresResubmit ? ' (Resubmit)' : ''}
                    </span>
                  </td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2">Total</td>
                <td>${formatCurrency(totalPremium)}</td>
                <td colspan="3"></td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>LIC Collection System - Premium Tracker Report</p>
            <p>Month: ${formatMonthDisplay(currentViewDate)} | Entries: ${allPremiumEntries.length}</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Report
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  window.deletePremiumEntry = function(id) {
    const entry = allPremiumEntries.find(e => e.id === id);
    if (!entry) return;
    
    const confirmDelete = confirm(`Are you sure you want to remove ${entry.name} (SL ${entry.sl}) from ${formatMonthDisplay(currentViewDate)} premium tracker?`);
    if (!confirmDelete) return;
    
    allPremiumEntries = allPremiumEntries.filter(entry => entry.id !== id);
    savePremiumData();
    
    refreshAllData();
    showToast(`${entry.name} removed from premium tracker!`, 'success');
  };
  
  /* ===================== REFRESH ALL DATA ===================== */
  function refreshAllData() {
    loadPremiumData();
    loadMasterClients();
    syncWithMasterList();
    updateStatistics();
    updateTotalCalculation();
    window.filterData(currentFilter);
  }
  
  /* ===================== EXPORT FUNCTION ===================== */
  window.exportPremiumData = function() {
    if (allPremiumEntries.length === 0) {
      showToast(`No premium data found for ${formatMonthDisplay(currentViewDate)}!`, 'warning');
      return;
    }
    
    const masterClients = getMasterClients();
    
    const totalPremium = allPremiumEntries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.premiumAmount) || 0);
    }, 0);
    
    const submittedPremium = allPremiumEntries
      .filter(entry => entry.status === 'submitted' && !entry.requiresResubmit)
      .reduce((sum, entry) => {
        return sum + (parseFloat(entry.premiumAmount) || 0);
      }, 0);
    
    const pendingPremium = allPremiumEntries
      .filter(entry => entry.status === 'pending' || entry.requiresResubmit)
      .reduce((sum, entry) => {
        return sum + (parseFloat(entry.premiumAmount) || 0);
      }, 0);
    
    let csvContent = `LIC Premium Tracker - ${formatMonthDisplay(currentViewDate)}\n`;
    csvContent += `Total Premium: ${formatCurrency(totalPremium)}, Submitted: ${formatCurrency(submittedPremium)}, Pending: ${formatCurrency(pendingPremium)}\n\n`;
    csvContent += "SL,Client Name,Premium Amount,Payment Method,Date Submitted,Status,Policy No,Table No,Premium Type,Sum Assured,DOC,Added Date,Last Updated,Requires Resubmit\n";
    
    allPremiumEntries.forEach(entry => {
      const masterClient = masterClients.find(c => parseInt(c.sl) === parseInt(entry.sl));
      
      csvContent += `"${entry.sl}","${entry.name}","${entry.premiumAmount}","${entry.paymentMethod}","${entry.dateSubmitted}","${entry.status}${entry.requiresResubmit ? ' (Needs Resubmit)' : ''}","${entry.policyNo}","${entry.tableNo}","${masterClient?.premiumType || '-'}","${masterClient?.sumAsset || '-'}","${masterClient?.doc || '-'}","${entry.addedDate}","${entry.lastUpdated || ''}","${entry.requiresResubmit ? 'Yes' : 'No'}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = currentMonthKey.replace('-', '');
    link.download = `premium-tracker-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`Exported ${allPremiumEntries.length} premium entries for ${formatMonthDisplay(currentViewDate)}!`, 'success');
  };
  
  window.refreshPremiumData = function() {
    refreshAllData();
    showToast(`Premium data refreshed for ${formatMonthDisplay(currentViewDate)}!`, 'success');
    animateElement('premiumTotalEntries');
  };
  
  init();
});