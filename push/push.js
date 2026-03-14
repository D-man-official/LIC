// ===== SheetDB API =====
const SHEETDB_API_PUSH = "https://sheetdb.io/api/v1/rzuqukl6peo56";

document.addEventListener("DOMContentLoaded", () => {

  // DOM Elements
  const slInput         = document.getElementById("sl");
  const nameInput       = document.getElementById("name");
  const amountInput     = document.getElementById("amount");
  const yearPicker      = document.getElementById("yearPicker");
  const monthPicker     = document.getElementById("monthPicker");
  const currentMonthBtn = document.getElementById("currentMonthBtn");
  const form            = document.getElementById("clientForm");
  const specialPushBtn  = document.getElementById("specialPushBtn");
  const submitBtn       = form.querySelector('button[type="submit"]');

  let isSpecialPush = false;

  // ===== NOTIFICATION =====
  function showNotification(message, type = "info") {
    const n = document.createElement("div");
    n.style.cssText = `
      position:fixed; top:80px; right:20px; padding:12px 20px;
      border-radius:8px; color:white; font-weight:500; z-index:9999;
      box-shadow:0 4px 12px rgba(0,0,0,0.15); animation:slideIn 0.3s ease;
      background:${
        type === "success" ? "linear-gradient(135deg,#10b981,#34d399)"
        : type === "error" ? "linear-gradient(135deg,#ef4444,#f87171)"
        : "linear-gradient(135deg,#3b82f6,#60a5fa)"
      };
    `;
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => {
      n.style.animation = "slideOut 0.3s ease";
      setTimeout(() => n.remove(), 300);
    }, 3000);
  }

  // Keyframe CSS
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
    @keyframes slideOut{ from{transform:translateX(0);opacity:1} to{transform:translateX(100%);opacity:0} }
    .suggestion-loading {
      padding:1rem 1.25rem; color:#6b7280;
      font-style:italic; font-size:0.9rem;
      display:flex; align-items:center; gap:0.5rem;
    }
    .suggestion-empty { padding:1rem 1.25rem; color:#ef4444; font-size:0.9rem; }
  `;
  document.head.appendChild(style);

  // ===== MONTH-YEAR PICKER =====
  const SELECTED_MONTH_KEY = "lastSelectedMonthYear";

  function saveSelectedMonth() {
    localStorage.setItem(SELECTED_MONTH_KEY, JSON.stringify({
      year: yearPicker.value,
      month: monthPicker.value
    }));
  }

  function loadSelectedMonth() {
    try {
      const saved = JSON.parse(localStorage.getItem(SELECTED_MONTH_KEY));
      if (saved?.year && saved?.month) {
        yearPicker.value  = saved.year;
        monthPicker.value = saved.month;
        return true;
      }
    } catch (e) {}
    return false;
  }

  function setupMonthYearPicker() {
    const now          = new Date();
    const currentYear  = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

    for (let y = 2024; y <= 2030; y++) {
      const opt = document.createElement("option");
      opt.value = y; opt.textContent = y;
      yearPicker.appendChild(opt);
    }

    if (!loadSelectedMonth()) {
      yearPicker.value  = currentYear;
      monthPicker.value = currentMonth;
    }

    Array.from(monthPicker.options).forEach(o => {
      if (o.value === currentMonth) {
        o.style.fontWeight = "bold";
        o.style.background = "#e0f2fe";
      }
    });

    yearPicker.addEventListener("change", saveSelectedMonth);
    monthPicker.addEventListener("change", saveSelectedMonth);
  }

  currentMonthBtn.addEventListener("click", () => {
    const now = new Date();
    yearPicker.value  = now.getFullYear();
    monthPicker.value = String(now.getMonth() + 1).padStart(2, "0");
    saveSelectedMonth();
    showNotification("Switched to current month", "success");
  });

  function getSelectedMonthKey() {
    return `${yearPicker.value}-${monthPicker.value}`;
  }

  // ===== SUGGESTION BOX =====
  const suggestionBox = document.createElement("div");
  suggestionBox.className = "suggestion-box";
  suggestionBox.style.display  = "none";
  suggestionBox.style.position = "absolute";
  document.body.appendChild(suggestionBox);

  let debounceTimer = null;

  function positionBox(inputEl) {
    const rect = inputEl.getBoundingClientRect();
    suggestionBox.style.width  = rect.width + "px";
    suggestionBox.style.left   = rect.left + window.scrollX + "px";
    suggestionBox.style.top    = rect.bottom + window.scrollY + 4 + "px";
    suggestionBox.style.zIndex = "9999";
  }

  function hideSuggestions() {
    suggestionBox.style.display = "none";
    suggestionBox.innerHTML = "";
  }

  // ===== CACHE — একবার fetch করে রাখো =====
  let cachedClients = null;

  async function getAllClients() {
    if (cachedClients) return cachedClients;
    const res = await fetch(SHEETDB_API_PUSH);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    cachedClients = Array.isArray(data) ? data : [];
    return cachedClients;
  }

  // SL ও Name দুটো দিয়েই filter
  function filterClients(query, allClients) {
    const q = query.toLowerCase().trim();
    return allClients.filter(c => {
      const sl   = String(c["Sl. No."]     || "").toLowerCase();
      const name = String(c["Client Name"] || "").toLowerCase();
      return sl.includes(q) || name.includes(q);
    }).slice(0, 8);
  }

  // ===== RENDER SUGGESTIONS =====
  function renderSuggestions(clients, inputEl) {
    suggestionBox.innerHTML = "";

    if (!clients.length) {
      const div = document.createElement("div");
      div.className = "suggestion-empty";
      div.textContent = "কোনো client পাওয়া যায়নি";
      suggestionBox.appendChild(div);
      return;
    }

    clients.forEach(c => {
      const sl     = c["Sl. No."]     || "";
      const name   = c["Client Name"] || "";
      const policy = c["Policy No."]  || "";

      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.innerHTML = `
        <span class="suggestion-sl">${sl}</span>
        <span class="suggestion-name">${name !== "-" ? name : "—"}</span>
        <span class="suggestion-policy">${policy !== "-" ? policy : ""}</span>
      `;

      // mousedown — blur এর আগে fire হয়, তাই suggestion হারায় না
      div.addEventListener("mousedown", (e) => {
        e.preventDefault();
        slInput.value   = sl;
        nameInput.value = name !== "-" ? name : "";
        // Amount নিজে দেবেন — auto-fill নেই
        hideSuggestions();
        amountInput.focus();
        showNotification(`✅ ${name} selected`, "success");
      });

      suggestionBox.appendChild(div);
    });
  }

  // ===== SEARCH HANDLER =====
  async function handleSearch(query, inputEl) {
    clearTimeout(debounceTimer);
    hideSuggestions();
    if (!query.trim()) return;

    suggestionBox.style.display = "block";
    positionBox(inputEl);
    suggestionBox.innerHTML = `<div class="suggestion-loading"><i class="fa-solid fa-spinner fa-spin"></i> Searching...</div>`;

    debounceTimer = setTimeout(async () => {
      try {
        const all     = await getAllClients();
        const matches = filterClients(query, all);
        positionBox(inputEl);
        renderSuggestions(matches, inputEl);
      } catch (err) {
        suggestionBox.innerHTML = `<div class="suggestion-empty">⚠️ ${err.message}</div>`;
      }
    }, 400);
  }

  // SL ও Name — দুটোতেই search চলবে
  slInput.addEventListener("input",   (e) => handleSearch(e.target.value, slInput));
  slInput.addEventListener("focus",   (e) => { if (e.target.value.trim()) handleSearch(e.target.value, slInput); });
  nameInput.addEventListener("input", (e) => handleSearch(e.target.value, nameInput));
  nameInput.addEventListener("focus", (e) => { if (e.target.value.trim()) handleSearch(e.target.value, nameInput); });

  // Outside click
  document.addEventListener("click", (e) => {
    if (!suggestionBox.contains(e.target) && e.target !== slInput && e.target !== nameInput) {
      hideSuggestions();
    }
  });

  // Scroll এ reposition
  window.addEventListener("scroll", () => {
    if (suggestionBox.style.display !== "none") {
      if (document.activeElement === slInput)   positionBox(slInput);
      if (document.activeElement === nameInput) positionBox(nameInput);
    }
  });

  // ===== VALIDATE =====
  function validateFormData(sl, name, amount) {
    if (!sl)     { alert("SL number দিন"); return false; }
    if (!name)   { alert("Client name দিন"); return false; }
    if (!amount) { alert("Amount দিন"); return false; }
    if (isNaN(amount) || Number(amount) <= 0) { alert("Valid amount দিন"); return false; }
    return { sl, name, amount: Number(amount) };
  }

  // ===== SPECIAL PUSH TOGGLE =====
  specialPushBtn.addEventListener("click", () => {
    isSpecialPush = !isSpecialPush;
    if (isSpecialPush) {
      specialPushBtn.innerHTML = '<i class="fa-solid fa-star"></i> Monthly Pay';
      specialPushBtn.style.background = "linear-gradient(135deg,#0f766e,#14b8a6)";
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Push Monthly Client';
      submitBtn.style.background = "linear-gradient(135deg,#0f766e,#14b8a6)";
      showNotification("Monthly pay mode ON", "success");
    } else {
      specialPushBtn.innerHTML = '<i class="fa-solid fa-star"></i> Monthly';
      specialPushBtn.style.background = "";
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Push Client';
      submitBtn.style.background = "";
    }
  });

  // ===== FORM SUBMIT =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const sl     = slInput.value.trim();
    const name   = nameInput.value.trim();
    const amount = amountInput.value.trim();
    const selectedMonthKey = getSelectedMonthKey();

    const validation = validateFormData(sl, name, amount);
    if (!validation) return;

    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled  = true;
    specialPushBtn.disabled = true;

    try {
      const storageKey = isSpecialPush ? "specialMonthlyClients" : "monthlyClients";
      let allData = JSON.parse(localStorage.getItem(storageKey)) || {};
      if (!allData[selectedMonthKey]) allData[selectedMonthKey] = [];

      const monthList     = allData[selectedMonthKey];
      const alreadyExists = monthList.some(c => String(c.sl) === String(sl));

      if (alreadyExists) {
        alert(`এই client ইতিমধ্যে ${selectedMonthKey} তে আছে${isSpecialPush ? " (special list)" : ""}`);
        return;
      }

      monthList.push({
        sl, name,
        amount: validation.amount,
        addedDate: new Date().toISOString(),
        isSpecial: isSpecialPush,
        pushedVia: isSpecialPush ? "monthly-btn" : "regular-push",
        month: selectedMonthKey,
      });

      localStorage.setItem(storageKey, JSON.stringify(allData));

      setTimeout(() => {
        alert(
          `✅ ${isSpecialPush ? "SPECIAL" : "REGULAR"} PUSH SUCCESS!\n\n` +
          `Client: "${name}" (SL: ${sl})\nAmount: ₹${validation.amount}\nMonth: ${selectedMonthKey}`
        );
      }, 100);

      slInput.value     = "";
      nameInput.value   = "";
      amountInput.value = "";
      hideSuggestions();

      isSpecialPush = false;
      specialPushBtn.innerHTML = '<i class="fa-solid fa-star"></i> Monthly';
      specialPushBtn.style.background = "";
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Push Client';
      submitBtn.style.background = "";

      submitBtn.classList.add("clicked");
      setTimeout(() => submitBtn.classList.remove("clicked"), 300);

    } catch (err) {
      console.error("Push error:", err);
      alert("Error occurred. Please try again.");
    } finally {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled  = false;
      specialPushBtn.disabled = false;
    }
  });

  // ===== CLEAR BUTTON =====
  form.addEventListener("reset", (e) => {
    e.preventDefault();
    slInput.value     = "";
    nameInput.value   = "";
    amountInput.value = "";
    hideSuggestions();
    isSpecialPush = false;
    specialPushBtn.innerHTML = '<i class="fa-solid fa-star"></i> Monthly';
    specialPushBtn.style.background = "";
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Push Client';
    submitBtn.style.background = "";
    submitBtn.disabled = false;
    submitBtn.classList.remove("clicked");
  });

  // ===== INITIALIZE =====
  setupMonthYearPicker();
});