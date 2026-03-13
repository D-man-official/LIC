const SHEETDB_API = "https://sheetdb.io/api/v1/rzuqukl6peo56";

function sheetUrl(colName, value) {
  return `${SHEETDB_API}/${encodeURIComponent(colName)}/${encodeURIComponent(value)}`;
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// ================= POLICY DETECTION =================
function getPolicyNameFromTableNo(tableNo) {
  if (!tableNo || tableNo === "-" || tableNo === "") return "";
  const t = String(tableNo);
  if (t.includes("814")) return "New Jeevan Anand";
  if (t.includes("820")) return "New Endowment Plan";
  return "";
}

function autoFillPolicyNameFromTableNo() {
  const tableNo = document.getElementById("tableNo").value;
  const policyNameInput = document.getElementById("policyName");
  if (!tableNo) return;
  const detectedName = getPolicyNameFromTableNo(tableNo);
  if (detectedName) {
    policyNameInput.value = detectedName;
    policyNameInput.style.borderColor = "#10b981";
    policyNameInput.style.boxShadow = "0 0 0 2px rgba(16,185,129,0.15)";
    setTimeout(() => {
      policyNameInput.style.borderColor = "";
      policyNameInput.style.boxShadow = "";
    }, 1500);
  }
}

// ================= FILL FORM FROM ROW =================
function fillFormFromRow(c) {
  document.getElementById('sl').value          = c["Sl. No."] || "";
  document.getElementById('name').value        = (c["Client Name"] && c["Client Name"] !== "-") ? c["Client Name"] : "";
  document.getElementById('policyNo').value    = (c["Policy No."] && c["Policy No."] !== "-") ? c["Policy No."] : "";
  document.getElementById('tableNo').value     = (c["Table No."] && c["Table No."] !== "-") ? c["Table No."] : "";
  document.getElementById('policyName').value  = (c["Policy Name"] && c["Policy Name"] !== "-") ? c["Policy Name"] : "";

  // Premium — strip ₹ and commas
  const premRaw = c["Premium"] || "";
  document.getElementById('premium').value = premRaw.replace(/[₹,]/g, '').trim() !== "-" ? premRaw.replace(/[₹,]/g, '').trim() : "";

  // Sum Assured — strip ₹ and commas
  const sumRaw = c["Sum Assured"] || "";
  document.getElementById('sumAsset').value = sumRaw.replace(/[₹,]/g, '').trim() !== "-" ? sumRaw.replace(/[₹,]/g, '').trim() : "";

  // Date of Commencement → yyyy-mm-dd for <input type="date">
  const docValue = c["Date of Commencement"];
  if (docValue && docValue !== "-") {
    const parts = docValue.split(/[\/\-]/);
    if (parts.length === 3) {
      let day, month, year;
      if (parts[0].length === 4) { year = parts[0]; month = parts[1]; day = parts[2]; }
      else { day = parts[0]; month = parts[1]; year = parts[2]; }
      document.getElementById('doc').value = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
    } else {
      document.getElementById('doc').value = docValue;
    }
  }

  // Premium Type
  const pt = c["Premium Type"];
  if (pt && pt !== "-") {
    const sel = document.getElementById('premiumType');
    for (let opt of sel.options) {
      if (opt.value === pt || opt.text === pt) { sel.value = opt.value; break; }
    }
  }

  // Policy badge hint
  const detectedName = getPolicyNameFromTableNo(c["Table No."]);
  if (detectedName) {
    const pg = document.querySelector("#policyName").closest(".form-group");
    // Remove any existing badge
    const existing = pg.querySelector('.detected-badge');
    if (existing) existing.remove();
    const div = document.createElement("div");
    div.className = "helper detected-badge";
    div.innerHTML = `<span style="color:${detectedName.includes('Jeevan') ? '#10b981' : '#3b82f6'};font-weight:600;">
      <i class="fa-solid fa-circle-info"></i> Detected: ${detectedName}
    </span>`;
    pg.appendChild(div);
  }
}

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", async function () {

  // Table No & Policy Name are optional
  document.getElementById("tableNo").removeAttribute("required");
  document.getElementById("policyName").removeAttribute("required");

  // Auto-fill on blur/enter in Table No field
  const tableNoInput = document.getElementById("tableNo");
  if (tableNoInput) {
    tableNoInput.addEventListener("blur", autoFillPolicyNameFromTableNo);
    tableNoInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); autoFillPolicyNameFromTableNo(); }
    });
  }

  addPolicyInfoBox();

  // ---- EDIT MODE ----
  const urlParams = new URLSearchParams(window.location.search);
  const editSl = urlParams.get('edit');

  if (editSl) {
    document.querySelector('.card-title').textContent = 'Edit Client';
    document.querySelector('.card-subtitle').textContent = 'Update the client details below';
    document.querySelector('.btn-primary').textContent = 'Update Client';
    document.getElementById('sl').readOnly = true;

    // Show loading indicator
    document.querySelector('.btn-primary').textContent = 'Loading...';
    document.querySelector('.btn-primary').disabled = true;

    try {
      // Fetch ALL rows and match SL locally — most reliable approach
      const res = await fetch(SHEETDB_API);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const allRows = await res.json();

      // Match by Sl. No. (compare as strings to handle "1" vs 1)
      const match = allRows.find(r => String(r["Sl. No."]).trim() === String(editSl).trim());

      if (match) {
        fillFormFromRow(match);
      } else {
        alert(`No client found with SL: ${editSl}`);
      }
    } catch (err) {
      console.error("Edit load error:", err);
      alert("Could not load client data. Please try again.\n" + err.message);
    } finally {
      document.querySelector('.btn-primary').textContent = 'Update Client';
      document.querySelector('.btn-primary').disabled = false;
    }
  }
});

// ================= FORM SUBMIT =================
document.getElementById("clientForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const btn = document.querySelector('.btn-primary');
  const originalText = btn.textContent;
  btn.textContent = "Saving...";
  btn.disabled = true;

  const urlParams = new URLSearchParams(window.location.search);
  const isEdit = urlParams.get('edit');

  const premiumRaw  = document.getElementById("premium").value.trim();
  const sumAssetRaw = document.getElementById("sumAsset").value.trim();
  const slValue     = document.getElementById("sl").value.trim();

  const rowData = {
    "Sl. No.":              slValue || "-",
    "Client Name":          document.getElementById("name").value.trim() || "-",
    "Policy No.":           document.getElementById("policyNo").value.trim() || "-",
    "Date of Commencement": document.getElementById("doc").value || "-",
    "Table No.":            document.getElementById("tableNo").value.trim() || "-",
    "Premium":              premiumRaw  ? premiumRaw  : "-",
    "Premium Type":         document.getElementById("premiumType").value || "-",
    "Sum Assured":          sumAssetRaw ? sumAssetRaw : "-",
    "Policy Name":          document.getElementById("policyName").value.trim() || "-"
  };

  try {
    if (isEdit) {
      // ---- PATCH (update existing row) ----
      const res = await fetch(sheetUrl("Sl. No.", isEdit), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rowData })
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);

      const detectedName = getPolicyNameFromTableNo(rowData["Table No."]);
      let msg = "✅ Client updated successfully!";
      if (detectedName) msg += `\n📋 Policy: ${detectedName}`;
      alert(msg);
      window.location.href = "../total_lic_holders_details/total_lic_holder_details.html";

    } else {
      // ---- CHECK DUPLICATE then ADD ----
      let existing = [];
      try {
        const allRes = await fetch(SHEETDB_API);
        if (allRes.ok) {
          const allRows = await allRes.json();
          existing = allRows.filter(r => String(r["Sl. No."]).trim() === String(slValue).trim());
        }
      } catch (_) { existing = []; }

      if (existing.length > 0) {
        if (!confirm(`SL ${slValue} already exists. Overwrite?`)) {
          btn.textContent = originalText;
          btn.disabled = false;
          return;
        }
        // PATCH to overwrite
        const res = await fetch(sheetUrl("Sl. No.", slValue), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: rowData })
        });
        if (!res.ok) throw new Error(`Overwrite failed: ${res.status}`);
      } else {
        // POST new row
        const res = await fetch(SHEETDB_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: rowData })
        });
        if (!res.ok) throw new Error(`Add failed: ${res.status}`);
      }

      const detectedName = getPolicyNameFromTableNo(rowData["Table No."]);
      let msg = "✅ Client added successfully!";
      if (detectedName) msg += `\n📋 Policy: ${detectedName}`;
      alert(msg);

      if (confirm("Go to Total Clients page?")) {
        window.location.href = "../total_lic_holders_details/total_lic_holder_details.html";
      } else {
        document.getElementById("clientForm").reset();
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
  } catch (err) {
    alert("❌ Error: " + err.message);
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// Ctrl+Shift+T shortcut
document.addEventListener("keydown", function (e) {
  const t = document.getElementById("tableNo");
  if (document.activeElement === t && e.ctrlKey && e.shiftKey && (e.key === "T" || e.key === "t")) {
    e.preventDefault();
    autoFillPolicyNameFromTableNo();
  }
});

// ================= POLICY INFO BOX =================
function addPolicyInfoBox() {
  const tableNoGroup = document.querySelector("#tableNo")?.closest(".form-group");
  if (!tableNoGroup) return;
  const infoBox = document.createElement("div");
  infoBox.className = "helper";
  infoBox.style.cssText = "margin-top:10px;padding:8px 12px;background:rgba(59,130,246,0.05);border-radius:6px;border-left:3px solid #3b82f6;";
  infoBox.innerHTML = `
    <div style="font-size:12px;color:#475569;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <i class="fa-solid fa-lightbulb" style="color:#f59e0b;"></i>
        <strong style="font-size:13px;">Quick Policy Guide:</strong>
      </div>
      <div style="margin-bottom:2px;">
        <span style="background:rgba(16,185,129,0.15);color:#10b981;padding:2px 8px;border-radius:4px;font-weight:600;font-size:11px;">814</span>
        → New Jeevan Anand
      </div>
      <div>
        <span style="background:rgba(59,130,246,0.15);color:#3b82f6;padding:2px 8px;border-radius:4px;font-weight:600;font-size:11px;">820</span>
        → New Endowment Plan
      </div>
    </div>`;
  tableNoGroup.appendChild(infoBox);
}