// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("clientTableBody");
  const searchInput = document.getElementById("clientSearchInput");
  const showingCount = document.getElementById("showingCount");
  const totalCount = document.getElementById("totalCount");
  const clientTotalEntries = document.getElementById("clientTotalEntries");
  
  // Get data from localStorage
  function getAllClientData() {
    const data = JSON.parse(localStorage.getItem("clients")) || [];
    console.log("Loaded from localStorage:", data);
    return data;
  }
  
  // Store data globally
  window.rawClientData = getAllClientData();
  window.clientData = [...window.rawClientData];
  window.currentFilter = 'all';
  
  // Calculate stats and update counts
  function calculateStats() {
    const totalClients = window.rawClientData.length;
    console.log("Total clients:", totalClients);
    
    if (totalCount) totalCount.textContent = totalClients;
    if (showingCount) showingCount.textContent = totalClients;
    if (clientTotalEntries) {
      clientTotalEntries.textContent = `${totalClients} ${totalClients === 1 ? 'Entry' : 'Entries'}`;
    }
    
    console.log("Updated counts - Total:", totalClients);
  }
  
  // Render table with enhanced styling
  function renderTable(data) {
    if (!tableBody) return;
    
    tableBody.innerHTML = "";
    
    if (data.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="padding: 3rem; text-align: center;">
            <div style="font-size: 3rem; color: var(--border-color); margin-bottom: 1rem;">
              <i class="fa-solid fa-user-slash"></i>
            </div>
            <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">No clients found</h3>
            <p style="color: var(--text-light);">Add your first client using the "Add New Client" button</p>
          </td>
        </tr>
      `;
      return;
    }
    
    data.forEach(item => {
      const tr = document.createElement("tr");
      
      const hasPolicy = item.policyNo !== "-" && item.policyNo !== "";
      const hasName = item.name !== "-";
      
      const nameAvatar = hasName ? 
        `<div class="client-avatar">${item.name.charAt(0)}</div>` :
        `<div class="client-avatar" style="background: var(--danger-red);">?</div>`;
      
      const formatCell = (value, isMonetary = false, isImportant = false) => {
        if (value === "-" || value === "" || value === null || value === undefined) {
          return `<span style="color: var(--text-light); font-style: italic;">-</span>`;
        }
        const colorClass = isMonetary ? (isImportant ? 'style="color: var(--success-green);"' : '') : '';
        return `<span ${colorClass}>${value}</span>`;
      };
      
      const rowClass = hasPolicy ? "complete-entry" : "incomplete-entry";
      
      tr.className = rowClass;
      tr.setAttribute('data-sl', item.sl);
      tr.setAttribute('data-has-policy', hasPolicy);
      
      tr.ondblclick = () => showClientDetails(item.sl);
      
      tr.innerHTML = `
        <td style="font-weight: 600; color: var(--primary-blue);">${item.sl}</td>
        <td>
          <div style="display: flex; align-items: center;">
            ${nameAvatar}
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">${formatCell(item.name)}</div>
              ${!hasName ? '<div style="font-size: 0.75rem; color: var(--danger-red); font-weight: 500;">Name Required</div>' : ''}
            </div>
          </div>
        </td>
        <td>
          ${formatCell(item.policyNo)}
          ${!hasPolicy ? '<div style="font-size: 0.75rem; color: var(--danger-red); font-weight: 500;">Policy Required</div>' : ''}
        </td>
        <td>${formatCell(item.doc)}</td>
        <td>${formatCell(item.tableNo)}</td>
        <td style="font-weight: 600;">${formatCell(item.premium, true, true)}</td>
        <td>${formatCell(item.premiumType)}</td>
        <td style="font-weight: 700; color: var(--secondary-purple);">${formatCell(item.sumAsset, true)}</td>
        <td>${formatCell(item.policyName)}</td>
        <td>
          <div class="table-row-actions">
            <div class="action-icon action-view" title="View Details" onclick="showClientDetails(${item.sl})">
              <i class="fa-solid fa-eye"></i>
            </div>
            <div class="action-icon action-edit" title="Edit Client" onclick="editClient(${item.sl})">
              <i class="fa-solid fa-pen"></i>
            </div>
            <div class="action-icon action-delete" title="Delete Client" onclick="deleteClient(${item.sl})" style="background: rgba(239, 71, 111, 0.1); color: var(--danger-red);">
              <i class="fa-solid fa-trash"></i>
            </div>
          </div>
        </td>
      `;
      
      tr.addEventListener('mouseenter', () => {
        tr.style.backgroundColor = 'var(--primary-blue-light)';
      });
      
      tr.addEventListener('mouseleave', () => {
        if (!tr.classList.contains('selected')) {
          tr.style.backgroundColor = '';
        }
      });
      
      tableBody.appendChild(tr);
    });
  }
  
  // Filter table data
  window.filterTableData = function(filterType) {
    window.currentFilter = filterType;
    let filtered = [...window.rawClientData];
    
    switch(filterType) {
      case 'withPolicy':
        filtered = filtered.filter(item => item.policyNo !== "-" && item.policyNo !== "");
        break;
      case 'noPolicy':
        filtered = filtered.filter(item => item.policyNo === "-" || item.policyNo === "");
        break;
      case 'blank':
        filtered = filtered.filter(item => item.name === "-");
        break;
      default:
        filtered = [...window.rawClientData];
    }
    
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.sl.toString().includes(searchTerm) ||
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.policyNo && item.policyNo.toLowerCase().includes(searchTerm)) ||
        (item.tableNo && item.tableNo.toLowerCase().includes(searchTerm)) ||
        (item.premiumType && item.premiumType.toLowerCase().includes(searchTerm)) ||
        (item.sumAsset && item.sumAsset.toLowerCase().includes(searchTerm)) ||
        (item.policyName && item.policyName.toLowerCase().includes(searchTerm))
      );
    }
    
    window.clientData = filtered;
    renderTable(filtered);
    if (showingCount) showingCount.textContent = filtered.length;
  };
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const value = e.target.value.toLowerCase();
      window.filterTableData(window.currentFilter);
    });
  }
  
  // Sort data by SL number (ascending)
  function sortDataBySL(data) {
    return [...data].sort((a, b) => Number(a.sl) - Number(b.sl));
  }
  
  // Initialize the table
  window.rawClientData = sortDataBySL(window.rawClientData);
  calculateStats();
  renderTable(window.rawClientData);
  window.filterTableData('all');
  
  console.log("Table initialized with", window.rawClientData.length, "clients");
});

// ================= HELPER FUNCTIONS =================

function editClient(sl) {
  const client = window.clientData.find(c => c.sl === sl) || 
                 window.rawClientData.find(c => c.sl === sl);
  
  if (client) {
    window.location.href = `../add_client/add.html?edit=${sl}`;
  }
}

function deleteClient(sl) {
  if (!confirm(`Are you sure you want to delete client SL: ${sl}?`)) return;

  const targetSl = Number(sl);
  let savedClients = JSON.parse(localStorage.getItem("clients")) || [];
  savedClients = savedClients.filter(c => Number(c.sl) !== targetSl);
  localStorage.setItem("clients", JSON.stringify(savedClients));

  window.rawClientData = savedClients;
  window.clientData = [...savedClients];

  if (window.filterTableData) {
    window.filterTableData(window.currentFilter || 'all');
  }

  if (typeof calculateStats === "function") {
    calculateStats();
  }

  alert(`✅ Client SL ${targetSl} deleted successfully`);
}

function showClientDetails(sl) {
  const client = window.clientData.find(c => c.sl === sl) || 
                 window.rawClientData.find(c => c.sl === sl);
  
  if (!client) return;
  
  const modal = document.getElementById('clientDetailModal');
  const content = document.getElementById('clientDetailContent');
  
  if (!modal || !content) return;
  
  content.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color);">
      <div class="client-avatar" style="width: 60px; height: 60px; font-size: 1.5rem;">
        ${client.name !== '-' ? client.name.charAt(0) : '?'}
      </div>
      <div>
        <h3 style="margin: 0; color: var(--text-primary);">${client.name !== '-' ? client.name : 'No Name'}</h3>
        <p style="margin: 0.25rem 0 0 0; color: var(--text-light);">Serial Number: ${client.sl}</p>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
      <div style="background: var(--light-bg); padding: 1rem; border-radius: 8px;">
        <div style="font-size: 0.875rem; color: var(--text-light); margin-bottom: 0.5rem;">Policy Number</div>
        <div style="font-weight: 600; color: var(--text-primary);">${client.policyNo !== '-' ? client.policyNo : 'Not Available'}</div>
      </div>
      
      <div style="background: var(--light-bg); padding: 1rem; border-radius: 8px;">
        <div style="font-size: 0.875rem; color: var(--text-light); margin-bottom: 0.5rem;">Document Date</div>
        <div style="font-weight: 600; color: var(--text-primary);">${client.doc !== '-' ? client.doc : 'Not Available'}</div>
      </div>
      
      <div style="background: var(--light-bg); padding: 1rem; border-radius: 8px;">
        <div style="font-size: 0.875rem; color: var(--text-light); margin-bottom: 0.5rem;">Table Number</div>
        <div style="font-weight: 600; color: var(--text-primary);">${client.tableNo !== '-' ? client.tableNo : 'Not Available'}</div>
      </div>
      
      <div style="background: var(--light-bg); padding: 1rem; border-radius: 8px;">
        <div style="font-size: 0.875rem; color: var(--text-light); margin-bottom: 0.5rem;">Premium Type</div>
        <div style="font-weight: 600; color: var(--text-primary);">${client.premiumType !== '-' ? client.premiumType : 'Not Available'}</div>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
      <div style="text-align: center; padding: 1.5rem; background: rgba(6, 214, 160, 0.1); border-radius: 12px;">
        <div style="font-size: 0.875rem; color: var(--text-light);">Premium Amount</div>
        <div style="font-size: 1.75rem; font-weight: 800; color: var(--success-green); margin-top: 0.5rem;">${client.premium !== '-' ? client.premium : 'Not Set'}</div>
      </div>
      
      <div style="text-align: center; padding: 1.5rem; background: rgba(67, 97, 238, 0.1); border-radius: 12px;">
        <div style="font-size: 0.875rem; color: var(--text-light);">Sum Assured</div>
        <div style="font-size: 1.75rem; font-weight: 800; color: var(--primary-blue); margin-top: 0.5rem;">${client.sumAsset !== '-' ? client.sumAsset : 'Not Set'}</div>
      </div>
    </div>
    
    <div style="margin-top: 1.5rem; padding: 1rem; background: ${client.policyNo === '-' ? 'rgba(239, 71, 111, 0.1)' : 'rgba(6, 214, 160, 0.1)'}; border-radius: 8px;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fa-solid ${client.policyNo === '-' ? 'fa-triangle-exclamation' : 'fa-check-circle'}" 
           style="color: ${client.policyNo === '-' ? 'var(--danger-red)' : 'var(--success-green)'};"></i>
        <span style="font-weight: 600; color: ${client.policyNo === '-' ? 'var(--danger-red)' : 'var(--success-green)'}">
          ${client.policyNo === '-' ? 'Policy Information Required' : 'Policy Active'}
        </span>
      </div>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: var(--text-secondary);">
        ${client.policyNo === '-' ? 'This client record is incomplete. Please add policy details.' : 'All policy information is complete.'}
      </p>
    </div>
  `;
  
  modal.style.display = 'flex';
  modal.setAttribute('data-current-sl', sl);
}

function closeModal() {
  const modal = document.getElementById('clientDetailModal');
  if (modal) modal.style.display = 'none';
}

function editCurrentClient() {
  const modal = document.getElementById('clientDetailModal');
  const sl = modal.getAttribute('data-current-sl');
  if (sl) {
    editClient(parseInt(sl));
    closeModal();
  }
}

function refreshData() {
    location.reload();
  
}

// ================= SIMPLE EXPORT FUNCTION =================
function exportData() {
  const dataToExport = window.clientData && window.clientData.length
    ? window.clientData
    : window.rawClientData;

  if (!dataToExport || dataToExport.length === 0) {
    alert("❌ No data to export");
    return;
  }

  // Sort data by SL number before exporting
  const sortedData = [...dataToExport].sort((a, b) => Number(a.sl) - Number(b.sl));
  
  // Create export object
  const exportObject = {
    clients: sortedData
  };

  // Convert to JSON string
  const jsonText = JSON.stringify(exportObject, null, 2);

  // Create TXT file
  const blob = new Blob([jsonText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `lic-data-${new Date().toISOString().split("T")[0]}.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  // Show success message
  const exportBtn = document.querySelector(".export-btn");
  if (exportBtn) {
    const original = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fa-solid fa-check"></i> Exported';
    setTimeout(() => {
      exportBtn.innerHTML = original;
    }, 2000);
  }
}

function addNewClient() {
  window.location.href = "../add_client/add.html";
}

function filterData(filterType) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  if (window.filterTableData) {
    window.filterTableData(filterType);
  }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('clientDetailModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal();
      }
    });
  }
  
  setTimeout(() => {
    if (window.rawClientData && window.rawClientData.length === 0) {
      const data = JSON.parse(localStorage.getItem("clients")) || [];
      if (data.length > 0) {
        console.log("Auto-refreshing data on load...");
        window.rawClientData = data;
        calculateStats();
        window.filterTableData('all');
      }
    }
  }, 100);
});

// ================= ENHANCED IMPORT FUNCTION =================
function importData() {
  const modal = document.getElementById("importConsoleModal");
  if (modal) modal.style.display = "flex";
}

function closeImportConsole() {
  document.getElementById("importConsoleModal").style.display = "none";
  document.getElementById("importConsoleTextarea").value = "";
}

// Global variables for conflict resolution
window.importState = {
  conflicts: [],
  nonDuplicates: [],
  decisions: {}, // sl -> 'replace' or 'skip'
  totalImportCount: 0
};

function applyImportConsole() {
  const rawText = document.getElementById("importConsoleTextarea").value.trim();

  if (!rawText) {
    alert("❌ No data pasted");
    return;
  }

  try {
    const parsed = JSON.parse(rawText);
    let newClientsArray = [];

    // Parse different JSON formats
    if (parsed.clients && typeof parsed.clients === "string") {
      newClientsArray = JSON.parse(parsed.clients);
    } else if (parsed.clients && Array.isArray(parsed.clients)) {
      newClientsArray = parsed.clients;
    } else if (Array.isArray(parsed)) {
      newClientsArray = parsed;
    } else if (typeof parsed === "object") {
      newClientsArray = [parsed];
    } else {
      throw new Error("Unsupported data format");
    }

    // Normalize SL as number
    newClientsArray = newClientsArray.map(c => ({
      ...c,
      sl: Number(c.sl)
    }));

    // Get existing data
    const existingClients = JSON.parse(localStorage.getItem("clients")) || [];
    
    // Reset import state
    window.importState = {
      conflicts: [],
      nonDuplicates: [],
      decisions: {},
      totalImportCount: newClientsArray.length
    };

    // Separate conflicts and non-duplicates
    newClientsArray.forEach(newClient => {
      const existingIndex = existingClients.findIndex(item => 
        Number(item.sl) === Number(newClient.sl)
      );
      
      if (existingIndex !== -1) {
        // Conflict found
        window.importState.conflicts.push({
          sl: newClient.sl,
          existing: existingClients[existingIndex],
          new: newClient,
          index: existingIndex
        });
        // Default decision is 'skip'
        window.importState.decisions[newClient.sl] = 'skip';
      } else {
        // New entry
        window.importState.nonDuplicates.push(newClient);
      }
    });

    // If there are conflicts, show conflict resolution modal
    if (window.importState.conflicts.length > 0) {
      showConflictResolutionModal();
    } else {
      // No conflicts, proceed directly
      finishImport();
    }

  } catch (err) {
    alert("❌ Invalid data format. Please paste valid JSON data.\n\nError: " + err.message);
    console.error("Import error:", err);
  }
}

function showConflictResolutionModal() {
  const modal = document.getElementById("conflictResolutionModal");
  const conflictList = document.getElementById("conflictList");
  const totalImport = document.getElementById("totalImportCount");
  const newEntries = document.getElementById("newEntriesCount");
  const duplicates = document.getElementById("duplicatesCount");
  const replaceCount = document.getElementById("replaceCount");
  
  // Update summary
  totalImport.textContent = window.importState.totalImportCount;
  newEntries.textContent = window.importState.nonDuplicates.length;
  duplicates.textContent = window.importState.conflicts.length;
  
  // Count current replace decisions
  const currentReplaceCount = Object.values(window.importState.decisions)
    .filter(decision => decision === 'replace').length;
  replaceCount.textContent = currentReplaceCount;
  
  // Build conflict list
  conflictList.innerHTML = '';
  
  window.importState.conflicts.forEach(conflict => {
    const decision = window.importState.decisions[conflict.sl] || 'skip';
    
    const conflictItem = document.createElement('div');
    conflictItem.className = 'conflict-item';
    conflictItem.innerHTML = `
      <div class="conflict-item-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="conflict-sl">SL: ${conflict.sl}</div>
          <div style="font-weight: 600; color: #e5e7eb;">
            ${conflict.existing.name || conflict.new.name || 'Unnamed Client'}
          </div>
        </div>
        <div class="conflict-buttons">
          <button class="conflict-btn skip ${decision === 'skip' ? 'selected' : ''}" 
                  onclick="setConflictDecision(${conflict.sl}, 'skip')">
            <i class="fa-solid fa-ban"></i> Keep Existing
          </button>
          <button class="conflict-btn replace ${decision === 'replace' ? 'selected' : ''}" 
                  onclick="setConflictDecision(${conflict.sl}, 'replace')">
            <i class="fa-solid fa-check"></i> Replace with New
          </button>
        </div>
      </div>
      
      <div class="conflict-comparison">
        <div class="existing-data">
          <div class="data-label">
            <i class="fa-solid fa-database" style="color: #ef4444;"></i>
            <span>EXISTING ENTRY</span>
          </div>
          <div class="data-value ${!conflict.existing.name || conflict.existing.name === '-' ? 'missing' : ''}">
            <strong>Name:</strong> ${conflict.existing.name || 'Not Set'}
          </div>
          <div class="data-value ${!conflict.existing.policyNo || conflict.existing.policyNo === '-' ? 'missing' : ''}">
            <strong>Policy:</strong> ${conflict.existing.policyNo || 'Not Set'}
          </div>
          <div class="data-value ${!conflict.existing.premium || conflict.existing.premium === '-' ? 'missing' : ''}">
            <strong>Premium:</strong> ${conflict.existing.premium || 'Not Set'}
          </div>
          <div class="data-value ${!conflict.existing.sumAsset || conflict.existing.sumAsset === '-' ? 'missing' : ''}">
            <strong>Sum Assured:</strong> ${conflict.existing.sumAsset || 'Not Set'}
          </div>
        </div>
        
        <div class="new-data">
          <div class="data-label">
            <i class="fa-solid fa-file-import" style="color: #22c55e;"></i>
            <span>NEW ENTRY</span>
          </div>
          <div class="data-value ${!conflict.new.name || conflict.new.name === '-' ? 'missing' : ''}">
            <strong>Name:</strong> ${conflict.new.name || 'Not Set'}
          </div>
          <div class="data-value ${!conflict.new.policyNo || conflict.new.policyNo === '-' ? 'missing' : ''}">
            <strong>Policy:</strong> ${conflict.new.policyNo || 'Not Set'}
          </div>
          <div class="data-value ${!conflict.new.premium || conflict.new.premium === '-' ? 'missing' : ''}">
            <strong>Premium:</strong> ${conflict.new.premium || 'Not Set'}
          </div>
          <div class="data-value ${!conflict.new.sumAsset || conflict.new.sumAsset === '-' ? 'missing' : ''}">
            <strong>Sum Assured:</strong> ${conflict.new.sumAsset || 'Not Set'}
          </div>
        </div>
      </div>
    `;
    
    conflictList.appendChild(conflictItem);
  });
  
  // Close import console and show conflict modal
  document.getElementById("importConsoleModal").style.display = "none";
  modal.style.display = "flex";
}

function setConflictDecision(sl, decision) {
  window.importState.decisions[sl] = decision;
  
  // Update UI
  const replaceCount = document.getElementById("replaceCount");
  const currentReplaceCount = Object.values(window.importState.decisions)
    .filter(d => d === 'replace').length;
  replaceCount.textContent = currentReplaceCount;
  
  // Re-render the conflict item
  showConflictResolutionModal();
}

function skipAllDuplicates() {
  window.importState.conflicts.forEach(conflict => {
    window.importState.decisions[conflict.sl] = 'skip';
  });
  showConflictResolutionModal();
}

function replaceAllDuplicates() {
  window.importState.conflicts.forEach(conflict => {
    window.importState.decisions[conflict.sl] = 'replace';
  });
  showConflictResolutionModal();
}

function cancelConflictResolution() {
  document.getElementById("conflictResolutionModal").style.display = "none";
  document.getElementById("importConsoleTextarea").value = "";
}

function applyConflictResolution() {
  // Get existing clients
  const existingClients = JSON.parse(localStorage.getItem("clients")) || [];
  const mergedClients = [...existingClients];
  
  // Apply decisions for conflicts
  let replacedCount = 0;
  let skippedCount = 0;
  
  window.importState.conflicts.forEach(conflict => {
    const decision = window.importState.decisions[conflict.sl];
    
    if (decision === 'replace') {
      // Replace existing entry
      const existingIndex = mergedClients.findIndex(item => 
        Number(item.sl) === Number(conflict.sl)
      );
      
      if (existingIndex !== -1) {
        mergedClients[existingIndex] = conflict.new;
        replacedCount++;
      }
    } else {
      // Skip - keep existing
      skippedCount++;
    }
  });
  
  // Add non-duplicates
  window.importState.nonDuplicates.forEach(client => {
    mergedClients.push(client);
  });
  
  // Sort by SL
  mergedClients.sort((a, b) => Number(a.sl) - Number(b.sl));
  
  // Save to localStorage
  localStorage.setItem("clients", JSON.stringify(mergedClients));
  
  // Show success message with emojis and formatting
  const successMessage = `
✅ IMPORT SUCCESSFUL!

┌─────────────────────────────┐
│ 📊 Import Summary           │
├─────────────────────────────┤
│ Total in import: ${window.importState.totalImportCount.toString().padStart(3)} │
│ New entries added: ${window.importState.nonDuplicates.length.toString().padStart(3)} │
│ Duplicates replaced: ${replacedCount.toString().padStart(3)} │
│ Duplicates skipped: ${skippedCount.toString().padStart(3)} │
│ Total clients now: ${mergedClients.length.toString().padStart(3)} │
└─────────────────────────────┘

🎉 Database updated successfully!
`;
  
  alert(successMessage);
  
  // Close modal and refresh page
  document.getElementById("conflictResolutionModal").style.display = "none";
  location.reload();
}

function finishImport() {
  // For imports without conflicts
  const existingClients = JSON.parse(localStorage.getItem("clients")) || [];
  const mergedClients = [...existingClients, ...window.importState.nonDuplicates];
  
  // Sort by SL
  mergedClients.sort((a, b) => Number(a.sl) - Number(b.sl));
  
  // Save to localStorage
  localStorage.setItem("clients", JSON.stringify(mergedClients));
  
  // Show success message
  const successMessage = `
✅ IMPORT SUCCESSFUL!

┌─────────────────────────────┐
│ 📊 Import Summary           │
├─────────────────────────────┤
│ Total imported: ${window.importState.totalImportCount.toString().padStart(3)} │
│ New entries added: ${window.importState.nonDuplicates.length.toString().padStart(3)} │
│ Duplicates found: 0        │
│ Total clients now: ${mergedClients.length.toString().padStart(3)} │
└─────────────────────────────┘

🎉 All entries added successfully!
`;
  
  alert(successMessage);
  
  // Close modal and refresh page
  document.getElementById("importConsoleModal").style.display = "none";
  document.getElementById("importConsoleTextarea").value = "";
  location.reload();
}