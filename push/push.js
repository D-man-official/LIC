// [file name]: push.js
// [file content begin]
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
  const yearPicker = document.getElementById("yearPicker");
  const monthPicker = document.getElementById("monthPicker");
  const currentMonthBtn = document.getElementById("currentMonthBtn");
  const form = document.getElementById("clientForm");
  const specialPushBtn = document.getElementById("specialPushBtn");
  const submitBtn = form.querySelector('button[type="submit"]');
  const clearBtn = form.querySelector('button[type="reset"]');

  // Flag to track if special push is selected
  let isSpecialPush = false;

  // ===== SAVE AND LOAD SELECTED MONTH-YEAR =====
  const SELECTED_MONTH_KEY = "lastSelectedMonthYear";

  function saveSelectedMonth() {
    const year = yearPicker.value;
    const month = monthPicker.value;
    localStorage.setItem(SELECTED_MONTH_KEY, JSON.stringify({ year, month }));
  }

  function loadSelectedMonth() {
    const saved = localStorage.getItem(SELECTED_MONTH_KEY);
    if (saved) {
      try {
        const { year, month } = JSON.parse(saved);
        if (year && month) {
          yearPicker.value = year;
          monthPicker.value = month;
          return true;
        }
      } catch (e) {
        console.error("Error loading saved month:", e);
      }
    }
    return false;
  }

  // ===== MONTH-YEAR PICKER SETUP =====
  function setupMonthYearPicker() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

    // Populate years (2024 to 2030)
    for (let year = 2024; year <= 2030; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearPicker.appendChild(option);
    }

    // Try to load saved month-year, otherwise use current
    const savedMonthLoaded = loadSelectedMonth();
    
    if (!savedMonthLoaded) {
      // Set default to current year and month
      yearPicker.value = currentYear;
      monthPicker.value = currentMonth;
    }

    // Highlight current month in dropdown
    Array.from(monthPicker.options).forEach((option) => {
      if (option.value === currentMonth) {
        option.style.fontWeight = "bold";
        option.style.background = "#e0f2fe";
      }
    });

    // Save month-year when changed
    yearPicker.addEventListener("change", saveSelectedMonth);
    monthPicker.addEventListener("change", saveSelectedMonth);
  }

  // Current Month Button
  currentMonthBtn.addEventListener("click", () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

    yearPicker.value = currentYear;
    monthPicker.value = currentMonth;
    
    // Save when switching to current month
    saveSelectedMonth();

    showNotification("Switched to current month", "success");
  });

  // ===== GET SELECTED MONTH KEY =====
  function getSelectedMonthKey() {
    const year = yearPicker.value;
    const month = monthPicker.value;
    return `${year}-${month}`; // Format: "2026-02"
  }

  // ===== SUGGESTION BOX =====
  const suggestionBox = document.createElement("div");
  suggestionBox.className = "suggestion-box";
  suggestionBox.style.display = "none";
  document.body.appendChild(suggestionBox);

  function showSuggestions(matches, inputElement) {
    suggestionBox.innerHTML = "";
    suggestionBox.style.display = "block";

    const rect = inputElement.getBoundingClientRect();
    suggestionBox.style.width = rect.width + "px";
    suggestionBox.style.left = rect.left + "px";
    suggestionBox.style.top = rect.bottom + window.scrollY + "px";

    matches.forEach((client) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";

      const policyInfo =
        client.policyNo && client.policyNo !== "-"
          ? ` | Policy: ${client.policyNo}`
          : "";
      div.innerHTML = `
                <span class="suggestion-sl">${client.sl}</span>
                <span class="suggestion-name">${client.name}</span>
                <span class="suggestion-policy">${policyInfo}</span>
            `;

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

    const matches = rawClientData.filter((client) => {
      if (!client) return false;

      const slMatch = client.sl && client.sl.toString().includes(value);
      const nameMatch =
        client.name &&
        client.name.toLowerCase().includes(value.toLowerCase()) &&
        client.name !== "-";

      return slMatch || nameMatch;
    });

    matches.length
      ? showSuggestions(matches.slice(0, 6), inputElement)
      : (suggestionBox.style.display = "none");
  }

  // ===== INPUT LISTENERS =====
  slInput.addEventListener("input", (e) =>
    handleSearch(e.target.value, slInput),
  );

  nameInput.addEventListener("input", (e) =>
    handleSearch(e.target.value, nameInput),
  );

  // ===== VALIDATE FORM DATA =====
  function validateFormData(sl, name, amount) {
    if (!sl || !name || !amount) {
      alert("Please fill all required fields");
      return false;
    }

    const client = rawClientData.find(
      (c) =>
        c.sl.toString() === sl ||
        (c.name && c.name.toLowerCase() === name.toLowerCase()),
    );

    if (!client) {
      alert(
        "Client not found in master list. Please add client first from 'Add Client' page.",
      );
      return false;
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return false;
    }

    return { client, amount: Number(amount) };
  }

  // ===== "1" BUTTON CLICK - TOGGLE SPECIAL PUSH MODE =====
  specialPushBtn.addEventListener("click", () => {
    isSpecialPush = !isSpecialPush;

    if (isSpecialPush) {
      specialPushBtn.classList.add("active");
      specialPushBtn.innerHTML = '<i class="fa-solid fa-star"></i> Monthly Pay';
      specialPushBtn.style.background =
        "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)";

      submitBtn.innerHTML =
        '<i class="fa-solid fa-paper-plane"></i> Push Monthly Client';
      submitBtn.style.background =
        "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)";

      showNotification("Switched to monthly pay mode", "success");
    } else {
      specialPushBtn.classList.remove("active");
      specialPushBtn.innerHTML = 'Monthly';
      specialPushBtn.style.background = "";

      submitBtn.innerHTML =
        '<i class="fa-solid fa-paper-plane"></i> Push Client';
      submitBtn.style.background = "";

      showNotification("Back to regular push mode", "info");
    }
  });

  // ===== FORM SUBMIT - ENHANCED WITH MONTH SELECTION =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const sl = slInput.value.trim();
    const name = nameInput.value.trim();
    const amount = amountInput.value.trim();
    const selectedMonthKey = getSelectedMonthKey(); // Get selected month

    const validation = validateFormData(sl, name, amount);
    if (!validation) return;

    const { client, amount: validatedAmount } = validation;

    // Add button loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    specialPushBtn.disabled = true;

    try {
      if (isSpecialPush) {
        // ===== SPECIAL PUSH LOGIC =====
        // Get ALL special monthly data (all months)
        let allSpecialMonthlyData =
          JSON.parse(localStorage.getItem("specialMonthlyClients")) || {};

        // Initialize array for selected month if not exists
        if (!allSpecialMonthlyData[selectedMonthKey]) {
          allSpecialMonthlyData[selectedMonthKey] = [];
        }

        // Check if client already added this month (special)
        const monthClients = allSpecialMonthlyData[selectedMonthKey];
        const alreadyExists = monthClients.some(
          (c) => c.sl.toString() === client.sl.toString(),
        );

        if (alreadyExists) {
          alert(
            `This client is already added for ${selectedMonthKey} (special list)`,
          );
          return;
        }

        // Add to selected month's special list
        monthClients.push({
          sl: client.sl,
          name: client.name,
          amount: validatedAmount,
          addedDate: new Date().toISOString(),
          policyNo: client.policyNo || "-",
          isSpecial: true,
          pushedVia: "1-button",
          pushDate: new Date().toISOString(),
          month: selectedMonthKey,
        });

        localStorage.setItem(
          "specialMonthlyClients",
          JSON.stringify(allSpecialMonthlyData),
        );

        // Success message
        setTimeout(() => {
          alert(
            `✅ SPECIAL PUSH SUCCESS!\n\nClient: "${client.name}" (SL: ${client.sl})\nAmount: ₹${validatedAmount}\nMonth: ${selectedMonthKey}\n\nThis client will appear in Daily page with special marking.`,
          );
        }, 100);
      } else {
        // ===== REGULAR PUSH LOGIC =====
        // Get ALL regular monthly data (all months)
        let allMonthlyData =
          JSON.parse(localStorage.getItem("monthlyClients")) || {};

        // Initialize array for selected month if not exists
        if (!allMonthlyData[selectedMonthKey]) {
          allMonthlyData[selectedMonthKey] = [];
        }

        // Check if client already added this month
        const monthClients = allMonthlyData[selectedMonthKey];
        const alreadyExists = monthClients.some(
          (c) => c.sl.toString() === client.sl.toString(),
        );

        if (alreadyExists) {
          alert(`This client is already added for ${selectedMonthKey}`);
          return;
        }

        // Add to selected month's regular list
        monthClients.push({
          sl: client.sl,
          name: client.name,
          amount: validatedAmount,
          addedDate: new Date().toISOString(),
          policyNo: client.policyNo || "-",
          isSpecial: false,
          pushedVia: "regular-push",
          pushDate: new Date().toISOString(),
          month: selectedMonthKey,
        });

        localStorage.setItem("monthlyClients", JSON.stringify(allMonthlyData));

        // Success message
        setTimeout(() => {
          alert(
            `✅ REGULAR PUSH SUCCESS!\n\nClient: "${client.name}" (SL: ${client.sl})\nAmount: ₹${validatedAmount}\nMonth: ${selectedMonthKey}\n\nThis client will appear in Daily page normally.`,
          );
        }, 100);
      }

      // সাবমিটের পর শুধু input fields clear করো
      slInput.value = "";
      nameInput.value = "";
      amountInput.value = "";
      
      // মাস-বছর রিসেট করো না - আগের মতোই থাকবে
      // isSpecialPush ফ্লাগ রিসেট করো
      isSpecialPush = false;
      suggestionBox.style.display = "none";

      // Reset buttons to normal state
      specialPushBtn.classList.remove("active");
      specialPushBtn.innerHTML = '<i class="fa-solid fa-star"> Monthly';
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
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      submitBtn.style.background = "";

      specialPushBtn.disabled = false;
      specialPushBtn.style.background = "";
    }
  });

  // ===== HELPER FUNCTIONS =====
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
      notification.style.background =
        "linear-gradient(135deg, #10b981 0%, #34d399 100%)";
    } else if (type === "error") {
      notification.style.background =
        "linear-gradient(135deg, #ef4444 0%, #f87171 100%)";
    } else {
      notification.style.background =
        "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)";
    }

    notification.textContent = message;
    document.body.appendChild(notification);

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
        
        /* Highlight current month in dropdown */
        option[selected] {
            font-weight: bold;
            background: #e0f2fe;
        }
    `;
  document.head.appendChild(style);

  // ===== INITIALIZE =====
  setupMonthYearPicker();

  // Close suggestion box when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !suggestionBox.contains(e.target) &&
      e.target !== slInput &&
      e.target !== nameInput
    ) {
      suggestionBox.style.display = "none";
    }
  });

  // Form reset handler - মাস-বছর রিসেট করো না
  form.addEventListener("reset", (e) => {
    // Prevent default reset behavior for month-year
    e.preventDefault();
    
    suggestionBox.style.display = "none";

    // Reset special push mode
    isSpecialPush = false;

    // Reset button states and styles
    specialPushBtn.classList.remove("active");
    specialPushBtn.innerHTML = '<i class="fa-solid fa-star"> Monthly';
    specialPushBtn.disabled = false;
    specialPushBtn.style.background = "";

    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Push Client';
    submitBtn.disabled = false;
    submitBtn.classList.remove("clicked");
    submitBtn.style.background = "";

    // শুধু input fields clear করো, মাস-বছর না
    slInput.value = "";
    nameInput.value = "";
    amountInput.value = "";
  });
});
