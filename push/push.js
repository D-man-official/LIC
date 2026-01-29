document.addEventListener("DOMContentLoaded", () => {
  // ===== GET CLIENT DATA FROM LOCALSTORAGE =====
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

  // DOM Elements
  const slInput = document.getElementById("sl");
  const nameInput = document.getElementById("name");
  const amountInput = document.getElementById("amount");
  const form = document.getElementById("clientForm");
  const specialPushBtn = document.getElementById("specialPushBtn");
  const submitBtn = form.querySelector('button[type="submit"]');
  const clearBtn = form.querySelector('button[type="reset"]');

  // Flag to track if special push is selected
  let isSpecialPush = false;

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

  /* ===== VALIDATE FORM DATA ===== */
  function validateFormData(sl, name, amount) {
    if (!sl || !name || !amount) {
      alert("Please fill all required fields");
      return false;
    }

    // Find client in localStorage data
    const client = rawClientData.find(
      c => c.sl.toString() === sl || 
           (c.name && c.name.toLowerCase() === name.toLowerCase())
    );

    if (!client) {
      alert("Client not found in master list. Please add client first from 'Add Client' page.");
      return false;
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return false;
    }

    return { client, amount: Number(amount) };
  }

  /* ===== "1" BUTTON CLICK - TOGGLE SPECIAL PUSH MODE ===== */
  specialPushBtn.addEventListener("click", () => {
    // Toggle special push mode
    isSpecialPush = !isSpecialPush;
    
    if (isSpecialPush) {
      // Activate special mode
      specialPushBtn.classList.add("active");
      specialPushBtn.innerHTML = 'Special Mode ON';
      specialPushBtn.style.background = "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)";
      
      // Update submit button text
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Push (Special)';
      submitBtn.style.background = "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)";
      
      // Show notification
      showNotification("Special Push Mode Activated", "success");
    } else {
      // Deactivate special mode
      specialPushBtn.classList.remove("active");
      specialPushBtn.innerHTML = '<i class="fa-solid fa-1"></i> ';
      specialPushBtn.style.background = "";
      
      // Reset submit button
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Push Client';
      submitBtn.style.background = "";
      
      showNotification("Special Push Mode Deactivated", "info");
    }
  });

  /* ===== FORM SUBMIT - HANDLE BOTH REGULAR AND SPECIAL PUSH ===== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const sl = slInput.value.trim();
    const name = nameInput.value.trim();
    const amount = amountInput.value.trim();

    const validation = validateFormData(sl, name, amount);
    if (!validation) return;

    const { client, amount: validatedAmount } = validation;

    // Add button loading state
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    specialPushBtn.disabled = true;

    try {
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

      if (isSpecialPush) {
        // ===== SPECIAL PUSH LOGIC =====
        // Get or create special monthly data
        let specialMonthlyData = JSON.parse(localStorage.getItem("specialMonthlyClients")) || { 
          month: currentMonth, 
          clients: [] 
        };

        // Reset if month changed
        if (specialMonthlyData.month !== currentMonth) {
          specialMonthlyData = { month: currentMonth, clients: [] };
        }

        // Check if client already added this month (special)
        const alreadyExists = specialMonthlyData.clients.some(
          c => c.sl.toString() === client.sl.toString()
        );

        if (alreadyExists) {
          alert("This client is already added for this month (special list)");
          return;
        }

        // Add to special monthly list
        specialMonthlyData.clients.push({
          sl: client.sl,
          name: client.name,
          amount: validatedAmount,
          addedDate: new Date().toISOString(),
          policyNo: client.policyNo || "-",
          isSpecial: true,
          pushedVia: "1-button",
          pushDate: new Date().toISOString()
        });

        localStorage.setItem("specialMonthlyClients", JSON.stringify(specialMonthlyData));

        // Success message
        setTimeout(() => {
          alert(`✅ SPECIAL PUSH SUCCESS!\n\nClient: "${client.name}" (SL: ${client.sl})\nAmount: ₹${validatedAmount}\n\nThis client will appear in Daily page with special marking.`);
        }, 100);
        
      } else {
        // ===== REGULAR PUSH LOGIC =====
        // Get or create regular monthly data
        let monthlyData = JSON.parse(localStorage.getItem("monthlyClients")) || { 
          month: currentMonth, 
          clients: [] 
        };

        // Reset if month changed
        if (monthlyData.month !== currentMonth) {
          monthlyData = { month: currentMonth, clients: [] };
        }

        // Check if client already added this month
        const alreadyExists = monthlyData.clients.some(
          c => c.sl.toString() === client.sl.toString()
        );

        if (alreadyExists) {
          alert("This client is already added for this month");
          return;
        }

        // Add to regular monthly list
        monthlyData.clients.push({
          sl: client.sl,
          name: client.name,
          amount: validatedAmount,
          addedDate: new Date().toISOString(),
          policyNo: client.policyNo || "-",
          isSpecial: false,
          pushedVia: "regular-push",
          pushDate: new Date().toISOString()
        });

        localStorage.setItem("monthlyClients", JSON.stringify(monthlyData));

        // Success message
        setTimeout(() => {
          alert(`✅ REGULAR PUSH SUCCESS!\n\nClient: "${client.name}" (SL: ${client.sl})\nAmount: ₹${validatedAmount}\n\nThis client will appear in Daily page normally.`);
        }, 100);
      }

      // Reset form and mode
      form.reset();
      isSpecialPush = false;
      suggestionBox.style.display = "none";
      
      // Reset buttons to normal state
      specialPushBtn.classList.remove("active");
      specialPushBtn.innerHTML = '<i class="fa-solid fa-1"></i> 1';
      specialPushBtn.style.background = "";
      
      // Add visual feedback
      submitBtn.classList.add("clicked");
      setTimeout(() => {
        submitBtn.classList.remove("clicked");
      }, 300);
      
    } catch (error) {
      console.error("Error in push operation:", error);
      alert("An error occurred. Please try again.");
    } finally {
      // Reset button state
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Push Client';
      submitBtn.disabled = false;
      submitBtn.style.background = "";
      
      specialPushBtn.disabled = false;
      specialPushBtn.style.background = "";
    }
  });

  // Close suggestion box when clicking outside
  document.addEventListener("click", (e) => {
    if (!suggestionBox.contains(e.target) && 
        e.target !== slInput && 
        e.target !== nameInput) {
      suggestionBox.style.display = "none";
    }
  });

  // Form reset handler
  form.addEventListener("reset", () => {
    suggestionBox.style.display = "none";
    
    // Reset special push mode
    isSpecialPush = false;
    
    // Reset button states and styles
    specialPushBtn.classList.remove("active");
    specialPushBtn.innerHTML = '<i class="fa-solid fa-1"></i> 1';
    specialPushBtn.disabled = false;
    specialPushBtn.style.background = "";
    
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Push Client';
    submitBtn.disabled = false;
    submitBtn.classList.remove("clicked");
    submitBtn.style.background = "";
  });

  /* ===== HELPER FUNCTION FOR NOTIFICATIONS ===== */
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.top = "80px";
    notification.style.right = "20px";
    notification.style.padding = "12px 20px";
    notification.style.borderRadius = "8px";
    notification.style.color = "white";
    notification.style.fontWeight = "500";
    notification.style.zIndex = "9999";
    notification.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    notification.style.animation = "slideIn 0.3s ease";
    
    if (type === "success") {
      notification.style.background = "linear-gradient(135deg, #10b981 0%, #34d399 100%)";
    } else if (type === "error") {
      notification.style.background = "linear-gradient(135deg, #ef4444 0%, #f87171 100%)";
    } else {
      notification.style.background = "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)";
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Add CSS for notifications
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});