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
    console.log("Loaded from localStorage:", data); // Debugging
    return data;
  }
  
  // Store data globally
  window.rawClientData = getAllClientData();
  window.clientData = [...window.rawClientData];
  window.currentFilter = 'all';
  
  // Calculate stats and update counts
  function calculateStats() {
    const totalClients = window.rawClientData.length;
    console.log("Total clients:", totalClients); // Debugging
    
    // ✅ সরাসরি আপডেট করো (আরেকবার চেক করে)
    if (totalCount) totalCount.textContent = totalClients;
    if (showingCount) showingCount.textContent = totalClients;
    if (clientTotalEntries) {
      clientTotalEntries.textContent = `${totalClients} ${totalClients === 1 ? 'Entry' : 'Entries'}`;
    }
    
    console.log("Updated counts - Total:", totalClients); // Debugging
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
      
      // Determine if this is a complete or incomplete entry
      const hasPolicy = item.policyNo !== "-" && item.policyNo !== "";
      const hasName = item.name !== "-";
      
      // Create avatar for name
      const nameAvatar = hasName ? 
        `<div class="client-avatar">${item.name.charAt(0)}</div>` :
        `<div class="client-avatar" style="background: var(--danger-red);">?</div>`;
      
      // Format cell content with styling
      const formatCell = (value, isMonetary = false, isImportant = false) => {
        if (value === "-" || value === "" || value === null || value === undefined) {
          return `<span style="color: var(--text-light); font-style: italic;">-</span>`;
        }
        const colorClass = isMonetary ? (isImportant ? 'style="color: var(--success-green);"' : '') : '';
        return `<span ${colorClass}>${value}</span>`;
      };
      
      // Determine row class based on completeness
      const rowClass = hasPolicy ? "complete-entry" : "incomplete-entry";
      
      tr.className = rowClass;
      tr.setAttribute('data-sl', item.sl);
      tr.setAttribute('data-has-policy', hasPolicy);
      
      // Add double-click event for details
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
      
      // Add hover effect
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
      default: // 'all'
        filtered = [...window.rawClientData];
    }
    
    // Apply search if there's a search term
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
  
  // Initialize the table
  calculateStats();
  renderTable(window.rawClientData);
  window.filterTableData('all');
  
  console.log("Table initialized with", window.rawClientData.length, "clients"); // Debugging
});

// Additional helper functions
function editClient(sl) {
  const client = window.clientData.find(c => c.sl === sl) || 
                 window.rawClientData.find(c => c.sl === sl);
  
  if (client) {
    // Redirect to edit page
    window.location.href = `../add_client/add.html?edit=${sl}`;
  }
}

function deleteClient(sl) {
  if (!confirm(`Are you sure you want to delete client SL: ${sl}?`)) return;

  // 🔥 Always normalize SL as number
  const targetSl = Number(sl);

  let savedClients = JSON.parse(localStorage.getItem("clients")) || [];

  // ✅ FIX: strict numeric comparison
  savedClients = savedClients.filter(c => Number(c.sl) !== targetSl);

  // Save back
  localStorage.setItem("clients", JSON.stringify(savedClients));

  // 🔄 Refresh in-memory data
  window.rawClientData = savedClients;
  window.clientData = [...savedClients];

  // Re-render table & stats
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

// Refresh data function
function refreshData() {
  console.log("Refresh clicked"); // Debugging
  window.rawClientData = JSON.parse(localStorage.getItem("clients")) || [];
  calculateStats();
  window.filterTableData(window.currentFilter);
  alert("✅ Data refreshed!");
}

// Export function
function exportData() {
  // 👉 Table এ বর্তমানে যেটা দেখাচ্ছে সেটাই export হবে
  const dataToExport = window.clientData && window.clientData.length
    ? window.clientData
    : window.rawClientData;

  if (!dataToExport || dataToExport.length === 0) {
    alert("❌ No data to export");
    return;
  }

  // 👉 localStorage-compatible structure
  const exportObject = {
    clients: JSON.stringify(dataToExport)
  };

  // 👉 Pretty JSON (console friendly)
  const jsonText = JSON.stringify(exportObject, null, 2);

  // 👉 Create TXT file
  const blob = new Blob([jsonText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `lic-clients-export-${new Date().toISOString().split("T")[0]}.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  // ✅ UI feedback
  const exportBtn = document.querySelector(".export-btn");
  if (exportBtn) {
    const original = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fa-solid fa-check"></i> Exported';
    setTimeout(() => {
      exportBtn.innerHTML = original;
    }, 2000);
  }
}


// Add new client
function addNewClient() {
  window.location.href = "../add_client/add.html";
}

// Filter data function (for buttons)
function filterData(filterType) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Filter logic will be handled in the main JavaScript
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
  
  // Auto-refresh on page load (just in case)
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

// Add new client function - make sure it works without anchor tag
function addNewClient() {
  window.location.href = "../add_client/add.html";
}

/* ================= IMPORT CONSOLE LOGIC ================= */

function importData() {
  const modal = document.getElementById("importConsoleModal");
  if (modal) modal.style.display = "flex";
}

function closeImportConsole() {
  document.getElementById("importConsoleModal").style.display = "none";
  document.getElementById("importConsoleTextarea").value = "";
}
function applyImportConsole() {
  const rawText = document.getElementById("importConsoleTextarea").value.trim();

  if (!rawText) {
    alert("❌ No data pasted");
    return;
  }

  try {
    const parsed = JSON.parse(rawText);
    let finalClientsArray = [];

    // 🧠 CASE 1: User pasted localStorage snapshot
    // { "clients": "[...]" }
    if (parsed.clients && typeof parsed.clients === "string") {
      finalClientsArray = JSON.parse(parsed.clients);
    }

    // 🧠 CASE 2: User pasted wrapped JSON
    // { "clients": [ {...}, {...} ] }
    else if (parsed.clients && Array.isArray(parsed.clients)) {
      finalClientsArray = parsed.clients;
    }

    // 🧠 CASE 3: User pasted raw array
    // [ {...}, {...} ]
    else if (Array.isArray(parsed)) {
      finalClientsArray = parsed;
    }

    // 🧠 CASE 4: User pasted single object
    // { sl:..., name:... }
    else if (typeof parsed === "object") {
      finalClientsArray = [parsed];
    }

    else {
      throw new Error("Unsupported data format");
    }

    // 🧼 Normalize SL as number (important)
    finalClientsArray = finalClientsArray.map(c => ({
      ...c,
      sl: Number(c.sl)
    }));

    // 💾 Save in exact format your app expects
    localStorage.setItem("clients", JSON.stringify(finalClientsArray));

    alert(`✅ Imported ${finalClientsArray.length} client(s) successfully`);
    location.reload();

  } catch (err) {
    alert("❌ Invalid or unsupported data format");
    console.error("Import error:", err);
  }
}
