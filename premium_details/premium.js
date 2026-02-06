
// Initialize storage keys
const PREMIUM_STORAGE_KEY = "premiumTrackerRecords";
const CLIENTS_STORAGE_KEY = "clients";

// Global variables
let premiumRecords = [];
let currentFilter = 'all';

// Initialize storage with sample data if empty
function initializeStorage() {
  // Initialize premium records
  if (!localStorage.getItem(PREMIUM_STORAGE_KEY)) {
    localStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify([]));
  }
  
  // Check if clients exist (they should from your other pages)
  if (!localStorage.getItem(CLIENTS_STORAGE_KEY)) {
    // If no clients exist, create some sample data
    const sampleClients = [
      { id: 1, sl: 1, name: "Rahul Sharma", policyNo: "LIC123456", doc: "15/05/2023", tableNo: "123", premium: "5000", premiumType: "Monthly", sumAsset: "500000", policyName: "Jeevan Anand" },
      { id: 2, sl: 2, name: "Priya Patel", policyNo: "LIC789012", doc: "20/06/2023", tableNo: "456", premium: "7500", premiumType: "Quarterly", sumAsset: "750000", policyName: "Jeevan Labh" },
      { id: 3, sl: 3, name: "Amit Kumar", policyNo: "LIC345678", doc: "10/07/2023", tableNo: "789", premium: "10000", premiumType: "Yearly", sumAsset: "1000000", policyName: "Jeevan Umang" }
    ];
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(sampleClients));
  }
}

// Load premium records from localStorage
function loadPremiumRecords() {
  const records = localStorage.getItem(PREMIUM_STORAGE_KEY);
  premiumRecords = records ? JSON.parse(records) : [];
  return premiumRecords;
}

// Save premium records to localStorage
function savePremiumRecords() {
  localStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(premiumRecords));
}

// Load clients from localStorage to populate dropdown
function loadClientsToDropdown() {
  const clients = JSON.parse(localStorage.getItem(CLIENTS_STORAGE_KEY)) || [];
  const clientSelect = document.getElementById('clientSelect');
  
  // Clear existing options except the first one
  clientSelect.innerHTML = '<option value="">Select a client to add...</option>';
  
  // Get existing premium records to avoid adding duplicates
  const existingClientIds = premiumRecords.map(record => record.clientId);
  
  // Add clients that are not already in premium tracker
  clients.forEach(client => {
    if (!existingClientIds.includes(client.id)) {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = `${client.sl}. ${client.name} (${client.policyNo})`;
      clientSelect.appendChild(option);
    }
  });
  
  // Update dropdown count
  const availableCount = clients.length - existingClientIds.length;
  if (availableCount === 0) {
    const option = document.createElement('option');
    option.value = "";
    option.textContent = "All clients are already in tracker";
    option.disabled = true;
    clientSelect.appendChild(option);
  }
}

// Add a new client to premium tracker
function addClientToTracker() {
  const clientSelect = document.getElementById('clientSelect');
  const selectedClientId = parseInt(clientSelect.value);
  
  if (!selectedClientId) {
    alert("Please select a client first!");
    return;
  }
  
  // Get client details from clients storage
  const clients = JSON.parse(localStorage.getItem(CLIENTS_STORAGE_KEY)) || [];
  const client = clients.find(c => c.id === selectedClientId);
  
  if (!client) {
    alert("Client not found in database!");
    return;
  }
  
  // Check if client already exists in premium tracker
  if (premiumRecords.some(record => record.clientId === selectedClientId)) {
    alert("This client is already in the premium tracker!");
    return;
  }
  
  // Create new premium record
  const newRecord = {
    id: Date.now(), // Unique ID for the record
    clientId: client.id,
    sl: client.sl,
    name: client.name,
    premiumAmount: "",
    paymentMethod: "",
    dateSubmitted: "",
    submissionLocation: "",
    status: "pending"
  };
  
  premiumRecords.push(newRecord);
  savePremiumRecords();
  
  // Refresh UI
  renderPremiumTable();
  loadClientsToDropdown();
  updateStats();
  
  // Reset select
  clientSelect.value = "";
  
  // Show success message
  showMessage(`Client "${client.name}" added to premium tracker successfully!`, 'success');
}

// Render premium table
function renderPremiumTable(filter = 'all') {
  const tableBody = document.getElementById('premiumTableBody');
  const noDataMessage = document.getElementById('noPremiumData');
  
  // Filter records
  let filteredRecords = premiumRecords;
  if (filter === 'submitted') {
    filteredRecords = premiumRecords.filter(record => record.status === 'submitted');
  } else if (filter === 'pending') {
    filteredRecords = premiumRecords.filter(record => record.status === 'pending');
  }
  
  // Clear table body
  tableBody.innerHTML = '';
  
  if (filteredRecords.length === 0) {
    noDataMessage.style.display = 'block';
    document.getElementById('showingCount').textContent = '0';
    document.getElementById('totalCount').textContent = premiumRecords.length;
    return;
  }
  
  noDataMessage.style.display = 'none';
  
  // Add rows for each premium record
  filteredRecords.forEach((record, index) => {
    const row = document.createElement('tr');
    
    // Determine status badge
    const statusClass = record.status === 'submitted' ? 'status-submitted' : 'status-pending';
    const statusText = record.status === 'submitted' ? 'Submitted' : 'Pending';
    
    // Format date for display
    let displayDate = record.dateSubmitted;
    if (displayDate) {
      const dateObj = new Date(displayDate);
      displayDate = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    row.innerHTML = `
      <td style="font-weight: 600; color: var(--primary-blue);">${record.sl}</td>
      <td style="font-weight: 600;">${record.name}</td>
      <td>
        <input 
          type="number" 
          class="premium-input" 
          data-id="${record.id}" 
          value="${record.premiumAmount || ''}" 
          placeholder="Enter amount"
          onchange="updateRecordField(${record.id}, 'premiumAmount', this.value)"
          min="0"
          step="0.01"
        >
      </td>
      <td>
        <select 
          class="premium-select" 
          data-id="${record.id}"
          onchange="updateRecordField(${record.id}, 'paymentMethod', this.value)"
        >
          <option value="">Select method</option>
          <option value="cash" ${record.paymentMethod === 'cash' ? 'selected' : ''}>Cash</option>
          <option value="upi" ${record.paymentMethod === 'upi' ? 'selected' : ''}>UPI</option>
          <option value="cheque" ${record.paymentMethod === 'cheque' ? 'selected' : ''}>Cheque</option>
          <option value="bank-transfer" ${record.paymentMethod === 'bank-transfer' ? 'selected' : ''}>Bank Transfer</option>
        </select>
      </td>
      <td>
        <input 
          type="date" 
          class="premium-input" 
          data-id="${record.id}" 
          value="${record.dateSubmitted || ''}" 
          onchange="updateRecordField(${record.id}, 'dateSubmitted', this.value)"
        >
      </td>
      <td>
        <select 
          class="premium-select" 
          data-id="${record.id}"
          onchange="updateRecordField(${record.id}, 'submissionLocation', this.value)"
        >
          <option value="">Select location</option>
          <option value="inside-office" ${record.submissionLocation === 'inside-office' ? 'selected' : ''}>Inside Office</option>
          <option value="outside-office" ${record.submissionLocation === 'outside-office' ? 'selected' : ''}>Outside Office</option>
        </select>
      </td>
      <td>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="delete-btn" onclick="deleteRecord(${record.id})" title="Remove from tracker">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Update counts
  document.getElementById('showingCount').textContent = filteredRecords.length;
  document.getElementById('totalCount').textContent = premiumRecords.length;
}

// Update a field in a record
function updateRecordField(recordId, field, value) {
  const recordIndex = premiumRecords.findIndex(record => record.id === recordId);
  
  if (recordIndex !== -1) {
    // Update the field
    premiumRecords[recordIndex][field] = value;
    
    // Check if all required fields are filled to update status
    const record = premiumRecords[recordIndex];
    const requiredFields = ['premiumAmount', 'paymentMethod', 'dateSubmitted', 'submissionLocation'];
    const allFieldsFilled = requiredFields.every(field => record[field] && record[field].toString().trim() !== '');
    
    // Update status based on field completion
    if (allFieldsFilled && record.status !== 'submitted') {
      record.status = 'submitted';
      // Re-render table to update status badge
      renderPremiumTable(currentFilter);
      updateStats();
    } else if (!allFieldsFilled && record.status === 'submitted') {
      record.status = 'pending';
      // Re-render table to update status badge
      renderPremiumTable(currentFilter);
      updateStats();
    }
    
    // Save changes
    savePremiumRecords();
  }
}

// Delete a record
function deleteRecord(recordId) {
  if (confirm("Are you sure you want to remove this client from the premium tracker?")) {
    premiumRecords = premiumRecords.filter(record => record.id !== recordId);
    savePremiumRecords();
    
    // Refresh UI
    renderPremiumTable(currentFilter);
    loadClientsToDropdown();
    updateStats();
    
    showMessage("Client removed from premium tracker successfully!", 'success');
  }
}

// Filter data
function filterData(filter) {
  currentFilter = filter;
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Find and activate the clicked button
  const buttons = document.querySelectorAll('.filter-btn');
  for (let btn of buttons) {
    if (btn.textContent.includes(filter === 'all' ? 'All Premiums' : 
                                filter === 'submitted' ? 'Submitted' : 'Pending')) {
      btn.classList.add('active');
      break;
    }
  }
  
  renderPremiumTable(filter);
}

// Update statistics
function updateStats() {
  const totalClients = premiumRecords.length;
  const submittedCount = premiumRecords.filter(record => record.status === 'submitted').length;
  const pendingCount = totalClients - submittedCount;
  
  document.getElementById('totalClients').textContent = totalClients;
  document.getElementById('submittedCount').textContent = submittedCount;
  document.getElementById('pendingCount').textContent = pendingCount;
  
  // Update header badge
  document.getElementById('premiumTotalEntries').textContent = `${totalClients} Entries`;
}

// Refresh premium data
function refreshPremiumData() {
  loadPremiumRecords();
  loadClientsToDropdown();
  renderPremiumTable(currentFilter);
  updateStats();
  showMessage("Premium data refreshed successfully!", 'success');
}

// Export premium data
function exportPremiumData() {
  if (premiumRecords.length === 0) {
    alert("No premium data to export!");
    return;
  }
  
  // Create export data
  const exportData = {
    exportDate: new Date().toISOString(),
    recordCount: premiumRecords.length,
    submittedCount: premiumRecords.filter(r => r.status === 'submitted').length,
    pendingCount: premiumRecords.filter(r => r.status === 'pending').length,
    premiumRecords: premiumRecords
  };
  
  // Convert to JSON string
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  // Create download link
  const url = URL.createObjectURL(dataBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `lic-premium-tracker-${new Date().toISOString().split('T')[0]}.json`;
  
  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  showMessage("Premium data exported successfully!", 'success');
}

// Show message
function showMessage(message, type = 'info') {
  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    background: ${type === 'success' ? 'var(--success-green)' : 'var(--primary-blue)'};
    color: white;
    font-weight: 600;
    z-index: 1000;
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.3s ease;
    max-width: 400px;
  `;
  
  messageDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(messageDiv);
  
  // Remove message after 3 seconds
  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, 300);
  }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize storage
  initializeStorage();
  
  // Load premium records
  loadPremiumRecords();
  
  // Load clients to dropdown
  loadClientsToDropdown();
  
  // Render table
  renderPremiumTable();
  
  // Update stats
  updateStats();
  
  // Add event listener for Add Client button
  document.getElementById('addClientBtn').addEventListener('click', addClientToTracker);
  
  // Add event listener for Enter key in client select
  document.getElementById('clientSelect').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addClientToTracker();
    }
  });
});

// Sidebar toggle function
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

// Close sidebar when clicking overlay
document.getElementById('overlay').addEventListener('click', toggleSidebar);
