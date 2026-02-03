function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// ================= POLICY DETECTION LOGIC (BASED ON TABLE NUMBER) =================

function getPolicyNameFromTableNo(tableNo) {
  if (!tableNo || tableNo === "-" || tableNo === "") {
    return "";
  }
  
  const tableStr = String(tableNo);
  
  // Check if table number contains 814
  if (tableStr.includes("814")) {
    return "New Jeevan Anand";
  }
  
  // Check if table number contains 820
  if (tableStr.includes("820")) {
    return "New Endowment Plan";
  }
  
  return "";
}

function autoFillPolicyNameFromTableNo() {
  const tableNo = document.getElementById("tableNo").value;
  const policyNameInput = document.getElementById("policyName");
  
  if (!tableNo || tableNo === "-" || tableNo === "") {
    return;
  }
  
  const detectedName = getPolicyNameFromTableNo(tableNo);
  
  if (detectedName) {
    // Only auto-fill if the field is empty or contains placeholder/default value
    if (!policyNameInput.value || 
        policyNameInput.value === "-" || 
        policyNameInput.value === "Enter policy name..." ||
        policyNameInput.value.toLowerCase().includes("jeevan") ||
        policyNameInput.value.toLowerCase().includes("endowment")) {
      policyNameInput.value = detectedName;
      
      // Show a brief notification
      const originalPlaceholder = policyNameInput.placeholder;
      policyNameInput.placeholder = `Auto-filled: ${detectedName}`;
      setTimeout(() => {
        policyNameInput.placeholder = originalPlaceholder;
      }, 2000);
      
      // Add visual feedback
      policyNameInput.style.borderColor = "#10b981";
      policyNameInput.style.boxShadow = "0 0 0 2px rgba(16, 185, 129, 0.15)";
      setTimeout(() => {
        policyNameInput.style.borderColor = "";
        policyNameInput.style.boxShadow = "";
      }, 1500);
    }
  }
}

// Check if we're editing an existing client
document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  const editSl = urlParams.get('edit');
  
  // Add table number auto-fill listener
  const tableNoInput = document.getElementById("tableNo");
  if (tableNoInput) {
    tableNoInput.addEventListener("blur", autoFillPolicyNameFromTableNo);
    
    // Also auto-fill on Enter key in table number field
    tableNoInput.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        autoFillPolicyNameFromTableNo();
      }
    });
  }
  
  // Add a helper button for auto-fill
  const policyNameGroup = document.querySelector("#policyName").closest(".form-group");
  if (policyNameGroup) {
    const helperDiv = document.createElement("div");
    helperDiv.className = "helper";
    helperDiv.innerHTML = `
      <span style="display: flex; align-items: center; gap: 4px;">
        <i class="fa-solid fa-wand-magic-sparkles" style="color: #3b82f6;"></i>
        <span>Tip: Enter table number containing 814 or 820 and the policy name will auto-fill!</span>
      </span>
    `;
    policyNameGroup.appendChild(helperDiv);
  }
  
  if (editSl) {
    // Change page title
    document.querySelector('.card-title').textContent = 'Edit Client';
    document.querySelector('.card-subtitle').textContent = 'Update the client details below';
    document.querySelector('.btn-primary').textContent = 'Update Client';
    
    // Load client data
    const savedClients = JSON.parse(localStorage.getItem("clients")) || [];
    const clientToEdit = savedClients.find(c => c.sl == editSl);
    
    if (clientToEdit) {
      // Fill form with client data
      document.getElementById('sl').value = clientToEdit.sl;
      document.getElementById('name').value = clientToEdit.name !== "-" ? clientToEdit.name : "";
      document.getElementById('policyNo').value = clientToEdit.policyNo !== "-" ? clientToEdit.policyNo : "";
      
      // Format date for input field
      const docValue = clientToEdit.doc;
      if (docValue && docValue !== "-") {
        // Convert dd/mm/yyyy to yyyy-mm-dd
        const parts = docValue.split(/[/-]/);
        if (parts.length === 3) {
          let day, month, year;
          if (parts[0].length === 4) { // yyyy-mm-dd format
            year = parts[0];
            month = parts[1];
            day = parts[2];
          } else { // dd/mm/yyyy format
            day = parts[0];
            month = parts[1];
            year = parts[2];
          }
          // Ensure two digits for month and day
          month = month.padStart(2, '0');
          day = day.padStart(2, '0');
          document.getElementById('doc').value = `${year}-${month}-${day}`;
        } else {
          document.getElementById('doc').value = docValue;
        }
      }
      
      document.getElementById('tableNo').value = clientToEdit.tableNo !== "-" ? clientToEdit.tableNo : "";
      document.getElementById('premium').value = clientToEdit.premium !== "-" ? clientToEdit.premium.replace('₹', '') : "";
      document.getElementById('premiumType').value = clientToEdit.premiumType !== "-" ? clientToEdit.premiumType : "";
      document.getElementById('sumAsset').value = clientToEdit.sumAsset !== "-" ? clientToEdit.sumAsset.replace('₹', '') : "";
      document.getElementById('policyName').value = clientToEdit.policyName !== "-" ? clientToEdit.policyName : "";
      
      // Make SL field read-only when editing
      document.getElementById('sl').readOnly = true;
      
      // Show detection info if table number contains 814/820
      const detectedName = getPolicyNameFromTableNo(clientToEdit.tableNo);
      if (detectedName) {
        const policyNameGroup = document.querySelector("#policyName").closest(".form-group");
        const infoDiv = document.createElement("div");
        infoDiv.className = "helper";
        infoDiv.innerHTML = `
          <span style="display: flex; align-items: center; gap: 6px; color: ${detectedName === "New Jeevan Anand" ? "#10b981" : "#3b82f6"}; font-weight: 600;">
            <i class="fa-solid fa-circle-info"></i>
            <span>Detected as: ${detectedName} (${clientToEdit.tableNo.includes('814') ? '🟢 814 series' : '🔵 820 series'})</span>
          </span>
        `;
        policyNameGroup.appendChild(infoDiv);
      }
    }
  }
});

const form = document.getElementById("clientForm");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  // Format premium with ₹ symbol
  const premiumValue = document.getElementById("premium").value;
  const formattedPremium = premiumValue ? `₹${premiumValue}` : "-";
  
  // Format sumAsset with ₹ symbol if not already
  let sumAssetValue = document.getElementById("sumAsset").value;
  if (sumAssetValue && !sumAssetValue.includes('₹')) {
    sumAssetValue = `₹${sumAssetValue}`;
  }

  const client = {
    sl: parseInt(document.getElementById("sl").value) || 0,
    name: document.getElementById("name").value || "-",
    policyNo: document.getElementById("policyNo").value || "-",
    doc: document.getElementById("doc").value || "-",
    tableNo: document.getElementById("tableNo").value || "-",
    premium: formattedPremium,
    premiumType: document.getElementById("premiumType").value || "-",
    sumAsset: sumAssetValue || "-",
    policyName: document.getElementById("policyName").value || "-"
  };

  // Get existing clients from localStorage
  let clients = JSON.parse(localStorage.getItem("clients")) || [];
  
  // Check if we're editing
  const urlParams = new URLSearchParams(window.location.search);
  const isEdit = urlParams.get('edit');
  
  if (isEdit) {
    // Update existing client
    const index = clients.findIndex(c => c.sl == isEdit);
    if (index >= 0) {
      clients[index] = client;
      localStorage.setItem("clients", JSON.stringify(clients));
      
      // Show success with policy type if detected
      const detectedName = getPolicyNameFromTableNo(client.tableNo);
      let successMessage = "✅ Client updated successfully!";
      if (detectedName) {
        successMessage += `\n\n📋 Policy type: ${detectedName} (${client.tableNo.includes('814') ? '814 series' : '820 series'})`;
      }
      alert(successMessage);
      
      window.location.href = "../total_lic_holders_details/total_lic_holder_details.html";
    }
  } else {
    // Add new client
    // Check if client with same SL exists
    const existingIndex = clients.findIndex(c => c.sl === client.sl);
    
    if (existingIndex >= 0) {
      if (confirm(`Client with SL ${client.sl} already exists. Overwrite?`)) {
        clients[existingIndex] = client;
      } else {
        return;
      }
    } else {
      // Add new client
      clients.push(client);
    }
    
    // Sort by SL
    clients.sort((a, b) => a.sl - b.sl);
    
    localStorage.setItem("clients", JSON.stringify(clients));
    
    // Show success with policy type if detected
    const detectedName = getPolicyNameFromTableNo(client.tableNo);
    let successMessage = "✅ Client added successfully!";
    if (detectedName) {
      successMessage += `\n\n📋 Policy type: ${detectedName} (${client.tableNo.includes('814') ? '814 series' : '820 series'})`;
    }
    alert(successMessage);
    
    // Ask if user wants to go to total page or stay
    if (confirm("Client added! Go to Total Clients page?")) {
      window.location.href = "../total_lic_holders_details/total_lic_holder_details.html";
    } else {
      form.reset();
    }
  }
});

// Add keyboard shortcut for auto-fill: Ctrl+Shift+T when in table number field
document.addEventListener("keydown", function(event) {
  const tableNoInput = document.getElementById("tableNo");
  if (document.activeElement === tableNoInput && event.ctrlKey && event.shiftKey && (event.key === "T" || event.key === "t")) {
    event.preventDefault();
    autoFillPolicyNameFromTableNo();
  }
});

// Add a small info box about policy types
function addPolicyInfoBox() {
  const tableNoGroup = document.querySelector("#tableNo").closest(".form-group");
  if (tableNoGroup) {
    const infoBox = document.createElement("div");
    infoBox.className = "helper";
    infoBox.style.marginTop = "10px";
    infoBox.style.padding = "8px 12px";
    infoBox.style.background = "rgba(59, 130, 246, 0.05)";
    infoBox.style.borderRadius = "6px";
    infoBox.style.borderLeft = "3px solid #3b82f6";
    infoBox.innerHTML = `
      <div style="font-size: 12px; color: #475569;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <i class="fa-solid fa-lightbulb" style="color: #f59e0b;"></i>
          <strong style="font-size: 13px;">Quick Policy Guide:</strong>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
          <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">Table No with 814</span>
          <span style="font-size: 12px;">→ New Jeevan Anand (Life cover + maturity)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">Table No with 820</span>
          <span style="font-size: 12px;">→ New Endowment Plan (Maturity + life cover)</span>
        </div>
      </div>
    `;
    tableNoGroup.appendChild(infoBox);
  }
}

// Call the info box function after DOM loads
setTimeout(addPolicyInfoBox, 300);