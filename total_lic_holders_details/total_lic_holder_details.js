// ================= SHEETDB API CONFIG =================
const SHEETDB_API = "https://sheetdb.io/api/v1/rzuqukl6peo56";

// ================= KEYBOARD SHORTCUTS =================
document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.shiftKey && (event.key === 'F' || event.key === 'f')) {
      event.preventDefault();
      const searchInput = document.getElementById('clientSearchInput');
      if (searchInput) { searchInput.focus(); searchInput.select(); }
    }
    if (event.ctrlKey && event.shiftKey && event.key === '8') {
      event.preventDefault();
      filterData('withPolicy');
      const s = document.getElementById('clientSearchInput');
      if (s) { s.value = '814'; window.filterTableData(window.currentFilter); }
    }
    if (event.ctrlKey && event.shiftKey && event.key === '0') {
      event.preventDefault();
      filterData('withPolicy');
      const s = document.getElementById('clientSearchInput');
      if (s) { s.value = '820'; window.filterTableData(window.currentFilter); }
    }
  });
});

// ================= POLICY DETECTION =================
function getPolicyNameFromTableNo(tableNo) {
  if (!tableNo || tableNo === "-" || tableNo === "") return "-";
  const t = String(tableNo);
  if (t.includes("814")) return "New Jeevan Anand";
  if (t.includes("820")) return "New Endowment Plan";
  return t;
}

function formatPolicyDisplay(tableNo, originalPolicyName) {
  const detectedName = getPolicyNameFromTableNo(tableNo);
  const originalName = originalPolicyName || "";
  if (detectedName !== tableNo && detectedName !== "-" && detectedName !== "") {
    let badgeText = "", badgeColor = "";
    if (detectedName === "New Jeevan Anand") {
      badgeText = "🟢 Jeevan Anand"; badgeColor = "var(--success-green)";
    } else if (detectedName === "New Endowment Plan") {
      badgeText = "🔵 Endowment Plan"; badgeColor = "var(--primary-blue)";
    }
    return `
      <div style="display:flex;flex-direction:column;gap:4px;">
        <div style="font-weight:600;color:var(--text-primary);">${detectedName}</div>
        <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:0.75rem;font-weight:700;
          background:rgba(${badgeColor==='var(--success-green)'?'16,185,129':'59,130,246'},0.1);
          color:${badgeColor};border:1px solid rgba(${badgeColor==='var(--success-green)'?'16,185,129':'59,130,246'},0.3);width:fit-content;">
          ${badgeText}
        </span>
        ${originalName && originalName !== detectedName && originalName !== "-" && originalName !== "" ?
          `<div style="font-size:0.75rem;color:var(--text-light);margin-top:4px;font-style:italic;">
            <i class="fa-solid fa-note-sticky" style="margin-right:4px;"></i>Original: ${originalName}
          </div>` : ''}
      </div>`;
  }
  return originalName && originalName !== "-" ? originalName : "-";
}

// ================= SHEETDB DATA FETCH =================
async function fetchClientsFromSheetDB() {
  try {
    showLoadingState();
    const response = await fetch(SHEETDB_API);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();

    // Normalize fields — mapping Sheet column names → app field names
    // Sheet headers (Row 2 after deleting title row):
    //   "Sl. No." | "Client Name" | "Policy No." | "Date of Commencement"
    //   "Table No." | "Premium" | "Premium Type" | "Sum Assured" | "Policy Name"
    return data.map(row => ({
      sl:          isNaN(row["Sl. No."]) ? row["Sl. No."] : Number(row["Sl. No."]),
      name:        row["Client Name"]           || "-",
      policyNo:    row["Policy No."]            || "-",
      doc:         row["Date of Commencement"]  || "-",
      tableNo:     row["Table No."]             || "-",
      premium:     row["Premium"]               || "-",
      premiumType: row["Premium Type"]          || "-",
      sumAsset:    row["Sum Assured"]           || "-",
      policyName:  row["Policy Name"]           || "-",
    }));
  } catch (err) {
    console.error("SheetDB fetch error:", err);
    showErrorState(err.message);
    return [];
  }
}

function showLoadingState() {
  const tableBody = document.getElementById("clientTableBody");
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="10" style="padding:3rem;text-align:center;">
        <div style="font-size:2.5rem;color:var(--primary-blue);margin-bottom:1rem;animation:spin 1s linear infinite;">
          <i class="fa-solid fa-spinner"></i>
        </div>
        <h3 style="color:var(--text-secondary);margin-bottom:0.5rem;">Loading clients...</h3>
        <p style="color:var(--text-light);">Fetching data from SheetDB</p>
      </td>
    </tr>`;
}

function showErrorState(message) {
  const tableBody = document.getElementById("clientTableBody");
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="10" style="padding:3rem;text-align:center;">
        <div style="font-size:2.5rem;color:var(--danger-red);margin-bottom:1rem;">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 style="color:var(--danger-red);margin-bottom:0.5rem;">Failed to load data</h3>
        <p style="color:var(--text-light);">${message}</p>
        <button onclick="refreshData()" class="action-btn primary" style="margin-top:1rem;">
          <i class="fa-solid fa-rotate-right"></i> Retry
        </button>
      </td>
    </tr>`;
}

// ================= MAIN INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  const tableBody        = document.getElementById("clientTableBody");
  const searchInput      = document.getElementById("clientSearchInput");
  const showingCount     = document.getElementById("showingCount");
  const totalCount       = document.getElementById("totalCount");
  const clientTotalEntries = document.getElementById("clientTotalEntries");

  // Fetch from SheetDB
  window.rawClientData = await fetchClientsFromSheetDB();
  window.clientData    = [...window.rawClientData];
  window.currentFilter = 'all';

  // Sort by SL
  window.rawClientData = [...window.rawClientData].sort((a, b) => Number(a.sl) - Number(b.sl));

  function calculateStats() {
    const t = window.rawClientData.length;
    if (totalCount)        totalCount.textContent = t;
    if (showingCount)      showingCount.textContent = t;
    if (clientTotalEntries) clientTotalEntries.textContent = `${t} ${t === 1 ? 'Entry' : 'Entries'}`;
  }

  function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = "";
    if (data.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="padding:3rem;text-align:center;">
            <div style="font-size:3rem;color:var(--border-color);margin-bottom:1rem;">
              <i class="fa-solid fa-user-slash"></i>
            </div>
            <h3 style="color:var(--text-secondary);margin-bottom:0.5rem;">No clients found</h3>
            <p style="color:var(--text-light);">Try a different filter or search term</p>
          </td>
        </tr>`;
      return;
    }

    data.forEach(item => {
      const tr = document.createElement("tr");
      const hasPolicy = item.policyNo !== "-" && item.policyNo !== "";
      const hasName   = item.name !== "-";

      const nameAvatar = hasName
        ? `<div class="client-avatar">${item.name.charAt(0)}</div>`
        : `<div class="client-avatar" style="background:var(--danger-red);">?</div>`;

      const formatCell = (value, isMonetary = false, isImportant = false) => {
        if (value === "-" || value === "" || value === null || value === undefined)
          return `<span style="color:var(--text-light);font-style:italic;">-</span>`;
        const colorClass = isMonetary && isImportant ? 'style="color:var(--success-green);"' : '';
        return `<span ${colorClass}>${value}</span>`;
      };

      tr.className = hasPolicy ? "complete-entry" : "incomplete-entry";
      tr.setAttribute('data-sl', item.sl);
      tr.setAttribute('data-has-policy', hasPolicy);
      tr.ondblclick = () => showClientDetails(item.sl);

      tr.innerHTML = `
        <td style="font-weight:800;color:#1d4ed8;background:rgba(59,130,246,0.08);text-align:center;font-size:1.1rem;border-right:2px solid #dbeafe;">
          <strong>${item.sl}</strong>
        </td>
        <td>
          <div style="display:flex;align-items:center;">
            ${nameAvatar}
            <div>
              <div style="font-weight:600;color:var(--text-primary);">${formatCell(item.name)}</div>
              ${!hasName ? '<div class="warning-text">Name Required</div>' : ''}
            </div>
          </div>
        </td>
        <td>
          ${formatCell(item.policyNo)}
          ${!hasPolicy ? '<div class="warning-text">Policy Required</div>' : ''}
        </td>
        <td style="text-align:center;min-width:90px;">${formatCell(item.doc)}</td>
        <td>${formatCell(item.tableNo)}</td>
        <td style="font-weight:600;">${formatCell(item.premium, true, true)}</td>
        <td>${formatCell(item.premiumType)}</td>
        <td style="font-weight:700;color:var(--secondary-purple);">${formatCell(item.sumAsset, true)}</td>
        <td>${formatPolicyDisplay(item.tableNo, item.policyName)}</td>
        <td>
          <div class="table-row-actions">
            <div class="action-icon action-view" title="View Details" onclick="showClientDetails(${item.sl})">
              <i class="fa-solid fa-eye"></i>
            </div>
            <div class="action-icon action-edit" title="Edit Client" onclick="editClient(${item.sl})">
              <i class="fa-solid fa-pen"></i>
            </div>
            <div class="action-icon action-delete" title="Delete Client" onclick="deleteClient(${item.sl})"
              style="background:rgba(239,71,111,0.15);color:var(--danger-red);border:1px solid rgba(239,71,111,0.3);">
              <i class="fa-solid fa-trash"></i>
            </div>
          </div>
        </td>`;

      tr.addEventListener('mouseenter', () => { tr.style.backgroundColor = 'var(--primary-blue-light)'; });
      tr.addEventListener('mouseleave', () => { if (!tr.classList.contains('selected')) tr.style.backgroundColor = ''; });

      tableBody.appendChild(tr);
    });

    setTimeout(enhanceMobileExperience, 100);
  }

  // Filter + search
  window.filterTableData = function (filterType) {
    window.currentFilter = filterType;
    let filtered = [...window.rawClientData];

    switch (filterType) {
      case 'withPolicy': filtered = filtered.filter(i => i.policyNo !== "-" && i.policyNo !== ""); break;
      case 'noPolicy':   filtered = filtered.filter(i => i.policyNo === "-" || i.policyNo === "");  break;
      case 'blank':      filtered = filtered.filter(i => i.name === "-"); break;
    }

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.sl.toString().includes(searchTerm) ||
        (item.name        && item.name.toLowerCase().includes(searchTerm))        ||
        (item.policyNo    && item.policyNo.toLowerCase().includes(searchTerm))    ||
        (item.tableNo     && item.tableNo.toLowerCase().includes(searchTerm))     ||
        (item.premiumType && item.premiumType.toLowerCase().includes(searchTerm)) ||
        (item.sumAsset    && item.sumAsset.toLowerCase().includes(searchTerm))    ||
        (item.policyName  && item.policyName.toLowerCase().includes(searchTerm))
      );
    }

    window.clientData = filtered;
    renderTable(filtered);
    if (showingCount) showingCount.textContent = filtered.length;
  };

  if (searchInput) {
    searchInput.addEventListener("input", () => window.filterTableData(window.currentFilter));
  }

  calculateStats();
  renderTable(window.rawClientData);
  window.filterTableData('all');
});

// ================= HELPER FUNCTIONS =================

function editClient(sl) {
  window.location.href = `../add_client/add.html?edit=${sl}`;
}

async function deleteClient(sl) {
  if (!confirm(`Are you sure you want to delete client SL: ${sl}?`)) return;

  try {
    const response = await fetch(`${SHEETDB_API}/${encodeURIComponent("Sl. No.")}/${encodeURIComponent(sl)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Delete failed: ${response.status}`);

    window.rawClientData = window.rawClientData.filter(c => Number(c.sl) !== Number(sl));
    window.clientData    = window.clientData.filter(c => Number(c.sl) !== Number(sl));
    if (window.filterTableData) window.filterTableData(window.currentFilter || 'all');
    alert(`✅ Client SL ${sl} deleted successfully`);
  } catch (err) {
    alert(`❌ Failed to delete: ${err.message}`);
  }
}

function showClientDetails(sl) {
  const client = window.clientData.find(c => Number(c.sl) === Number(sl)) ||
                 window.rawClientData.find(c => Number(c.sl) === Number(sl));
  if (!client) return;

  const modal   = document.getElementById('clientDetailModal');
  const content = document.getElementById('clientDetailContent');
  if (!modal || !content) return;

  const detectedPolicyName = getPolicyNameFromTableNo(client.tableNo);
  const showOriginalName   = client.policyName && client.policyName !== detectedPolicyName && client.policyName !== "-";

  content.innerHTML = `
  <div class="detail-header">
    <div class="detail-avatar">${client.name !== '-' ? client.name.charAt(0) : '?'}</div>
    <div>
      <h2>${client.name !== '-' ? client.name : 'No Name'}</h2>
      <p>SL: ${client.sl}</p>
      <span class="status ${client.policyNo === '-' ? 'inactive' : 'active'}">
        ${client.policyNo === '-' ? 'Policy Missing' : 'Policy Active'}
      </span>
    </div>
  </div>
  <div class="detail-money">
    <div><span>Premium</span><strong>${client.premium !== '-' ? client.premium : '—'}</strong></div>
    <div><span>Sum Assured</span><strong>${client.sumAsset !== '-' ? client.sumAsset : '—'}</strong></div>
  </div>
  <div class="detail-grid">
    <div><label>Policy No</label><p>${client.policyNo || '—'}</p></div>
    <div><label>DOC</label><p>${client.doc || '—'}</p></div>
    <div><label>Table No</label><p>${client.tableNo || '—'}</p></div>
    <div><label>Premium Type</label><p>${client.premiumType || '—'}</p></div>
    <div class="full">
      <label>Policy Name</label>
      <p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="font-weight:700;color:var(--text-primary);font-size:1.1rem;">${detectedPolicyName}</div>
          ${client.tableNo && (client.tableNo.includes('814') || client.tableNo.includes('820')) ?
            `<span style="display:inline-block;padding:4px 12px;border-radius:12px;font-size:0.85rem;font-weight:700;
              background:${client.tableNo.includes('814') ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)'};
              color:${client.tableNo.includes('814') ? 'var(--success-green)' : 'var(--primary-blue)'};
              border:1px solid ${client.tableNo.includes('814') ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)'};
              width:fit-content;">
              ${client.tableNo.includes('814') ? '🟢 814 series (Jeevan Anand)' : '🔵 820 series (Endowment Plan)'}
            </span>` : ''}
          ${showOriginalName ?
            `<div style="font-size:0.85rem;color:var(--text-light);margin-top:4px;">
              <i class="fa-solid fa-note-sticky" style="margin-right:6px;"></i>Original: ${client.policyName}
            </div>` : ''}
        </div>
      </p>
    </div>
  </div>`;

  modal.style.display = 'flex';
  modal.setAttribute('data-current-sl', sl);
}

function closeModal() {
  const modal = document.getElementById('clientDetailModal');
  if (modal) modal.style.display = 'none';
}

function editCurrentClient() {
  const modal = document.getElementById('clientDetailModal');
  const sl    = modal.getAttribute('data-current-sl');
  if (sl) { editClient(parseInt(sl)); closeModal(); }
}

function refreshData() {
  location.reload();
}

// ================= FILTER BUTTONS =================
function filterData(filterType) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) {
    let btn = event.target;
    while (btn && !btn.classList.contains('filter-btn')) btn = btn.parentElement;
    if (btn) btn.classList.add('active');
  }
  if (window.filterTableData) window.filterTableData(filterType);
}

function addNewClient() {
  window.location.href = "../add_client/add.html";
}

// ================= MODAL CLOSE ON OUTSIDE CLICK =================
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('clientDetailModal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
  }
});

// ================= MOBILE ENHANCEMENTS =================
function enhanceMobileExperience() {
  document.querySelectorAll('.action-icon').forEach(icon => {
    icon.style.cursor = 'pointer';
    icon.style.userSelect = 'none';
    icon.style.webkitTapHighlightColor = 'transparent';
  });
  document.querySelectorAll('#clientTableMain tbody tr').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('touchstart', function () { this.style.backgroundColor = 'var(--primary-blue-light)'; });
    row.addEventListener('touchend',   function () { setTimeout(() => { this.style.backgroundColor = ''; }, 300); });
  });
}

window.addEventListener('resize', function () {
  document.querySelectorAll('#clientTableMain td:nth-child(1)').forEach(cell => {
    const v = cell.textContent.trim();
    if (v && !isNaN(v)) cell.innerHTML = `<span style="display:inline-block;width:30px;text-align:right;">${String(v).padStart(3,' ')}</span>`;
  });
});

// CSS spinner animation (injected once)
const style = document.createElement('style');
style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(style);