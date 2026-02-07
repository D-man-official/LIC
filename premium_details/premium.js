// ===================== NEW premium.js CONTENT =====================
document.addEventListener("DOMContentLoaded", () => {
  /* ===================== CONSTANTS ===================== */
  const PREMIUM_ENTRIES_KEY = "premiumEntries";
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
  
  let allPremiumEntries = [];
  let filteredEntries = [];
  let currentFilter = 'all';
  
  /* ===================== INITIALIZATION ===================== */
  function init() {
    loadMasterClients();
    loadPremiumData();
    updateStatistics();
    renderTable();
    
    // Auto-sync with master list
    syncWithMasterList();
    
    // Event listeners
    addClientBtn.addEventListener("click", addClientToTracker);
    
    // Refresh data every 30 seconds (optional)
    setInterval(refreshAllData, 30000);
  }
  
  /* ===================== LOAD MASTER CLIENTS FOR DROPDOWN ===================== */
  function loadMasterClients() {
    // Get fresh data from localStorage EVERY TIME
    const masterClients = getMasterClients();
    
    // Clear existing options except first
    clientSelect.innerHTML = '<option value="">Select a client to add...</option>';
    
    if (masterClients.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No clients found in database";
      option.disabled = true;
      clientSelect.appendChild(option);
      return;
    }
    
    // Add clients that are NOT already in premium tracker
    const existingPremiumSLs = allPremiumEntries.map(entry => entry.sl);
    
    // Sort by SL number
    const sortedClients = masterClients.sort((a, b) => Number(a.sl) - Number(b.sl));
    
    sortedClients.forEach(client => {
      // Skip if already in premium tracker
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
    
    // If all clients are already in premium tracker
    if (clientSelect.options.length === 1 && clientSelect.options[0].disabled) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "All clients already in premium tracker";
      option.disabled = true;
      clientSelect.appendChild(option);
    }
  }
  
  /* ===================== GET FRESH MASTER CLIENTS ===================== */
  function getMasterClients() {
    // Always get fresh data from localStorage
    try {
      const rawData = localStorage.getItem(MASTER_CLIENTS_KEY);
      if (!rawData) return [];
      
      const clients = JSON.parse(rawData);
      // Filter out completely empty entries
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
  
  /* ===================== LOAD PREMIUM DATA ===================== */
  function loadPremiumData() {
    allPremiumEntries = JSON.parse(localStorage.getItem(PREMIUM_ENTRIES_KEY)) || [];
    filteredEntries = [...allPremiumEntries];
    
    // Sort by SL number for consistent display
    allPremiumEntries.sort((a, b) => Number(a.sl) - Number(b.sl));
    filteredEntries.sort((a, b) => Number(a.sl) - Number(b.sl));
    
    // Update counts
    const entryCount = allPremiumEntries.length;
    premiumTotalEntries.textContent = `${entryCount} ${entryCount === 1 ? 'Entry' : 'Entries'}`;
    totalCount.textContent = entryCount;
    showingCount.textContent = entryCount;
  }
  
  /* ===================== SYNC WITH MASTER LIST ===================== */
  function syncWithMasterList() {
    const masterClients = getMasterClients();
    const masterClientSLs = masterClients.map(client => parseInt(client.sl));
    
    // Remove premium entries for clients no longer in master list
    let removedCount = 0;
    const updatedPremiumEntries = allPremiumEntries.filter(premiumEntry => {
      const existsInMaster = masterClientSLs.includes(parseInt(premiumEntry.sl));
      if (!existsInMaster) {
        removedCount++;
        console.log(`Removing premium entry for SL ${premiumEntry.sl} - client not found in master list`);
      }
      return existsInMaster;
    });
    
    // Update if any were removed
    if (removedCount > 0) {
      allPremiumEntries = updatedPremiumEntries;
      localStorage.setItem(PREMIUM_ENTRIES_KEY, JSON.stringify(allPremiumEntries));
      loadPremiumData();
      renderTable();
      
      if (removedCount > 0) {
        console.log(`Synced: Removed ${removedCount} premium entries (clients deleted from master list)`);
      }
    }
  }
  
  /* ===================== UPDATE STATISTICS ===================== */
  function updateStatistics() {
    // Get FRESH data every time
    const masterClients = getMasterClients();
    
    // Total clients from master list (dynamic)
    const totalMasterClients = masterClients.length;
    totalClients.textContent = totalMasterClients;
    
    // Count submitted and pending from premium entries
    const submitted = allPremiumEntries.filter(entry => entry.status === 'submitted').length;
    const pending = allPremiumEntries.filter(entry => entry.status === 'pending').length;
    
    submittedCount.textContent = submitted;
    pendingCount.textContent = pending;
    
    // Also update the header badge with fresh count
    const premiumCount = allPremiumEntries.length;
    premiumTotalEntries.textContent = `${premiumCount} ${premiumCount === 1 ? 'Entry' : 'Entries'}`;
  }
  
  /* ===================== ADD CLIENT TO TRACKER ===================== */
  function addClientToTracker() {
    const selectedValue = clientSelect.value;
    if (!selectedValue) {
      alert("Please select a client first!");
      return;
    }
    
    // Get FRESH master client data
    const masterClients = getMasterClients();
    const selectedClient = masterClients.find(client => 
      parseInt(client.sl) === parseInt(selectedValue)
    );
    
    if (!selectedClient) {
      alert("Client not found in master database!");
      loadMasterClients(); // Refresh dropdown
      return;
    }
    
    // Check if already in tracker
    const alreadyExists = allPremiumEntries.some(entry => 
      parseInt(entry.sl) === parseInt(selectedClient.sl)
    );
    
    if (alreadyExists) {
      alert("This client is already in the premium tracker!");
      return;
    }
    
    // Get fresh master data for this client (in case it was updated)
    const clientName = selectedClient.name && selectedClient.name !== "-" ? 
                      selectedClient.name : "Unnamed Client";
    const clientPremium = selectedClient.premium && selectedClient.premium !== "-" ? 
                         selectedClient.premium : "0";
    const clientPolicy = selectedClient.policyNo && selectedClient.policyNo !== "-" ? 
                        selectedClient.policyNo : "-";
    const clientTableNo = selectedClient.tableNo && selectedClient.tableNo !== "-" ? 
                         selectedClient.tableNo : "-";
    
    // Create new premium entry
    const newEntry = {
      id: Date.now(), // Unique ID
      sl: parseInt(selectedClient.sl),
      name: clientName,
      premiumAmount: clientPremium,
      paymentMethod: '', // Empty initially
      dateSubmitted: '', // Empty initially
      status: 'pending', // Default status
      policyNo: clientPolicy,
      tableNo: clientTableNo,
      premiumType: selectedClient.premiumType || '-',
      sumAssured: selectedClient.sumAsset || '-',
      doc: selectedClient.doc || '-',
      addedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString()
    };
    
    // Add to entries
    allPremiumEntries.push(newEntry);
    localStorage.setItem(PREMIUM_ENTRIES_KEY, JSON.stringify(allPremiumEntries));
    
    // Refresh ALL data
    refreshAllData();
    
    // Show success message
    alert(`✅ Client ${clientName} (SL ${selectedClient.sl}) added to premium tracker!`);
    
    // Scroll to the new entry
    setTimeout(() => {
      const newRow = document.querySelector(`[data-sl="${selectedClient.sl}"]`);
      if (newRow) {
        newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        newRow.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        setTimeout(() => {
          newRow.style.backgroundColor = '';
        }, 2000);
      }
    }, 500);
  }
  
  /* ===================== RENDER TABLE ===================== */
  function renderTable() {
    premiumTableBody.innerHTML = '';
    
    if (filteredEntries.length === 0) {
      noPremiumData.style.display = 'flex';
      return;
    }
    
    noPremiumData.style.display = 'none';
    
    filteredEntries.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.setAttribute('data-sl', entry.sl);
      
      // Get fresh master data for this client
      const masterClients = getMasterClients();
      const masterClient = masterClients.find(c => parseInt(c.sl) === parseInt(entry.sl));
      
      // If master client exists and has updated data, sync it
      if (masterClient) {
        // Update name if changed in master
        const masterName = masterClient.name && masterClient.name !== "-" ? 
                          masterClient.name : "Unnamed Client";
        if (entry.name !== masterName) {
          entry.name = masterName;
        }
        
        // Update premium if changed in master
        const masterPremium = masterClient.premium && masterClient.premium !== "-" ? 
                             masterClient.premium : "0";
        if (entry.premiumAmount !== masterPremium) {
          entry.premiumAmount = masterPremium;
        }
      }
      
      // Format date for display (if exists)
      const displayDate = entry.dateSubmitted ? 
        new Date(entry.dateSubmitted).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) : '';
      
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
          <input type="number" 
                 class="premium-input" 
                 value="${entry.premiumAmount}" 
                 onchange="updatePremiumAmount(${entry.id}, this.value)"
                 placeholder="Amount"
                 style="font-weight: 600; color: #059669;">
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
          <span class="status-badge status-${entry.status}">
            ${entry.status === 'submitted' ? 'Submitted' : 'Pending'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn mark-submitted" onclick="toggleStatus(${entry.id})" 
                    title="${entry.status === 'pending' ? 'Mark as Submitted' : 'Mark as Pending'}">
              <i class="fa-solid fa-${entry.status === 'pending' ? 'check' : 'clock'}"></i>
            </button>
            <button class="delete-btn" onclick="deletePremiumEntry(${entry.id})" title="Remove">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      
      premiumTableBody.appendChild(row);
    });
    
    showingCount.textContent = filteredEntries.length;
  }
  
  /* ===================== FILTER FUNCTIONS ===================== */
  window.filterData = function(filterType) {
    currentFilter = filterType;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter entries
    switch(filterType) {
      case 'submitted':
        filteredEntries = allPremiumEntries.filter(entry => entry.status === 'submitted');
        break;
      case 'pending':
        filteredEntries = allPremiumEntries.filter(entry => entry.status === 'pending');
        break;
      default: // 'all'
        filteredEntries = [...allPremiumEntries];
    }
    
    renderTable();
  };
  
  /* ===================== UPDATE FUNCTIONS (Make them global) ===================== */
  window.updatePremiumAmount = function(id, amount) {
    const entryIndex = allPremiumEntries.findIndex(entry => entry.id === id);
    if (entryIndex !== -1) {
      allPremiumEntries[entryIndex].premiumAmount = amount;
      allPremiumEntries[entryIndex].lastUpdated = new Date().toISOString();
      localStorage.setItem(PREMIUM_ENTRIES_KEY, JSON.stringify(allPremiumEntries));
      updateStatistics();
    }
  };
  
  window.updatePaymentMethod = function(id, method) {
    const entryIndex = allPremiumEntries.findIndex(entry => entry.id === id);
    if (entryIndex !== -1) {
      allPremiumEntries[entryIndex].paymentMethod = method;
      allPremiumEntries[entryIndex].lastUpdated = new Date().toISOString();
      localStorage.setItem(PREMIUM_ENTRIES_KEY, JSON.stringify(allPremiumEntries));
    }
  };
  
  window.updateDateSubmitted = function(id, date) {
    const entryIndex = allPremiumEntries.findIndex(entry => entry.id === id);
    if (entryIndex !== -1) {
      allPremiumEntries[entryIndex].dateSubmitted = date;
      allPremiumEntries[entryIndex].lastUpdated = new Date().toISOString();
      
      // Auto-set status to submitted if date is entered
      if (date && allPremiumEntries[entryIndex].status === 'pending') {
        allPremiumEntries[entryIndex].status = 'submitted';
        updateStatistics();
      }
      
      localStorage.setItem(PREMIUM_ENTRIES_KEY, JSON.stringify(allPremiumEntries));
      if (currentFilter === 'all') renderTable();
    }
  };
  
  window.toggleStatus = function(id) {
    const entryIndex = allPremiumEntries.findIndex(entry => entry.id === id);
    if (entryIndex !== -1) {
      const newStatus = allPremiumEntries[entryIndex].status === 'pending' ? 'submitted' : 'pending';
      allPremiumEntries[entryIndex].status = newStatus;
      
      // Auto-set date to today if status changed to submitted
      if (newStatus === 'submitted' && !allPremiumEntries[entryIndex].dateSubmitted) {
        allPremiumEntries[entryIndex].dateSubmitted = new Date().toISOString().split('T')[0];
      }
      
      allPremiumEntries[entryIndex].lastUpdated = new Date().toISOString();
      localStorage.setItem(PREMIUM_ENTRIES_KEY, JSON.stringify(allPremiumEntries));
      
      updateStatistics();
      if (currentFilter !== 'all') window.filterData(currentFilter);
      else renderTable();
    }
  };
  
  window.deletePremiumEntry = function(id) {
    const entry = allPremiumEntries.find(e => e.id === id);
    if (!entry) return;
    
    if (!confirm(`Are you sure you want to remove ${entry.name} (SL ${entry.sl}) from premium tracker?`)) return;
    
    allPremiumEntries = allPremiumEntries.filter(entry => entry.id !== id);
    localStorage.setItem(PREMIUM_ENTRIES_KEY, JSON.stringify(allPremiumEntries));
    
    refreshAllData();
    alert(`✅ ${entry.name} removed from premium tracker!`);
  };
  
  /* ===================== REFRESH ALL DATA ===================== */
  function refreshAllData() {
    loadPremiumData();
    loadMasterClients(); // Refresh dropdown
    syncWithMasterList(); // Sync with master
    updateStatistics(); // Update counts
    window.filterData(currentFilter); // Re-apply current filter
  }
  
  /* ===================== EXPORT FUNCTION ===================== */
  window.exportPremiumData = function() {
    if (allPremiumEntries.length === 0) {
      alert("No premium data to export!");
      return;
    }
    
    // Get fresh master data for better export
    const masterClients = getMasterClients();
    
    // Create CSV content
    let csvContent = "SL,Client Name,Premium Amount,Payment Method,Date Submitted,Status,Policy No,Table No,Premium Type,Sum Assured,DOC,Added Date,Last Updated\n";
    
    allPremiumEntries.forEach(entry => {
      const masterClient = masterClients.find(c => parseInt(c.sl) === parseInt(entry.sl));
      
      csvContent += `"${entry.sl}","${entry.name}","${entry.premiumAmount}","${entry.paymentMethod}","${entry.dateSubmitted}","${entry.status}","${entry.policyNo}","${entry.tableNo}","${masterClient?.premiumType || '-'}","${masterClient?.sumAsset || '-'}","${masterClient?.doc || '-'}","${entry.addedDate}","${entry.lastUpdated || ''}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `premium-tracker-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Exported ${allPremiumEntries.length} premium entries successfully!`);
  };
  
  /* ===================== REFRESH FUNCTION ===================== */
  window.refreshPremiumData = function() {
    refreshAllData();
    alert("✅ Premium data refreshed with latest from master database!");
  };
  
  // Initialize
  init();
});