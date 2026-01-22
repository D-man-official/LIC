document.addEventListener("DOMContentLoaded", () => {
  // ===== GET CLIENT DATA FROM LOCALSTORAGE =====
  // Instead of hardcoded data, fetch from the main client database
  const getClientsFromStorage = () => {
    try {
      const clients = JSON.parse(localStorage.getItem("clients")) || [];
      console.log("Loaded clients from localStorage:", clients.length);
      return clients;
    } catch (error) {
      console.error("Error loading clients from localStorage:", error);
      return [];
    }
  };

  // Load client data from localStorage
  const rawClientData = getClientsFromStorage();

  const slInput = document.getElementById("sl");
  const nameInput = document.getElementById("name");
  const form = document.getElementById("clientForm");

  /* ===== Create suggestion box ===== */
  const suggestionBox = document.createElement("div");
  suggestionBox.style.position = "absolute";
  suggestionBox.style.background = "#fff";
  suggestionBox.style.border = "1px solid #e5e7eb";
  suggestionBox.style.borderRadius = "8px";
  suggestionBox.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
  suggestionBox.style.zIndex = "999";
  suggestionBox.style.display = "none";
  document.body.appendChild(suggestionBox);

  function showSuggestions(matches, inputElement) {
    suggestionBox.innerHTML = "";
    suggestionBox.style.display = "block";

    const rect = inputElement.getBoundingClientRect();
    suggestionBox.style.width = rect.width + "px";
    suggestionBox.style.left = rect.left + "px";
    suggestionBox.style.top = rect.bottom + window.scrollY + "px";

    matches.forEach(client => {
      const div = document.createElement("div");
      div.style.padding = "10px 12px";
      div.style.cursor = "pointer";
      div.style.fontSize = "14px";
      
      // Display client info with policy number if available
      const policyInfo = client.policyNo && client.policyNo !== "-" 
        ? ` | Policy: ${client.policyNo}` 
        : "";
      div.innerHTML = `<strong>${client.sl}</strong> - ${client.name}${policyInfo}`;

      div.addEventListener("mouseenter", () => {
        div.style.background = "#f1f5f9";
      });
      div.addEventListener("mouseleave", () => {
        div.style.background = "#fff";
      });

      div.addEventListener("click", () => {
        slInput.value = client.sl;
        nameInput.value = client.name;
        suggestionBox.style.display = "none";
      });

      suggestionBox.appendChild(div);
    });
  }

  function handleSearch(value, inputElement) {
    if (!value) {
      suggestionBox.style.display = "none";
      return;
    }

    // Filter clients from localStorage data
    const matches = rawClientData.filter(client => {
      // Handle cases where client or name might be undefined/null
      if (!client) return false;
      
      const slMatch = client.sl && client.sl.toString().includes(value);
      const nameMatch = client.name && 
                       client.name.toLowerCase().includes(value.toLowerCase()) &&
                       client.name !== "-";
      
      return slMatch || nameMatch;
    });

    matches.length
      ? showSuggestions(matches.slice(0, 6), inputElement)
      : (suggestionBox.style.display = "none");
  }

  /* ===== Input listeners ===== */
  slInput.addEventListener("input", e =>
    handleSearch(e.target.value, slInput)
  );

  nameInput.addEventListener("input", e =>
    handleSearch(e.target.value, nameInput)
  );

  /* ===== Form submit ===== */
  form.addEventListener("submit", e => {
    e.preventDefault();

    const sl = slInput.value.trim();
    const name = nameInput.value.trim();
    const amount = document.getElementById("amount").value.trim();

    if (!sl || !name || !amount) {
      alert("Please fill all required fields");
      return;
    }

    // Find client in localStorage data
    const client = rawClientData.find(
      c => c.sl.toString() === sl || 
           (c.name && c.name.toLowerCase() === name.toLowerCase())
    );

    if (!client) {
      alert("Client not found in master list. Please add client first from 'Add Client' page.");
      return;
    }

    // Check if amount is valid number
    if (isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

    let monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));

    if (!monthlyData || monthlyData.month !== currentMonth) {
      monthlyData = {
        month: currentMonth,
        clients: []
      };
    }

    // Check if client already added this month
    const alreadyExists = monthlyData.clients.some(
      c => c.sl.toString() === client.sl.toString()
    );

    if (alreadyExists) {
      alert("This client is already added for this month");
      return;
    }

    // Add to monthly list
    monthlyData.clients.push({
      sl: client.sl,
      name: client.name,
      amount: Number(amount),
      addedDate: new Date().toISOString(),
      policyNo: client.policyNo || "-"
    });

    localStorage.setItem("monthlyClients", JSON.stringify(monthlyData));

    alert(`✅ Client "${client.name}" (SL: ${client.sl}) added to Monthly List with amount: ₹${amount}`);

    form.reset();
    suggestionBox.style.display = "none";
  });

  // Close suggestion box when clicking outside
  document.addEventListener("click", (e) => {
    if (!suggestionBox.contains(e.target) && 
        e.target !== slInput && 
        e.target !== nameInput) {
      suggestionBox.style.display = "none";
    }
  });
});