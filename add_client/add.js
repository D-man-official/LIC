function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// Check if we're editing an existing client
document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  const editSl = urlParams.get('edit');
  
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
      alert("✅ Client updated successfully!");
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
    alert("✅ Client added successfully!");
    
    // Ask if user wants to go to total page or stay
    if (confirm("Client added! Go to Total Clients page?")) {
      window.location.href = "../total_lic_holders_details/total_lic_holder_details.html";
    } else {
      form.reset();
    }
  }
});