document.addEventListener("DOMContentLoaded", () => {

  const PREFERENCES_KEY = "monthlyPreferences";

  const searchInput = document.getElementById("searchClient");
  const searchBtn = document.getElementById("searchBtn");
  const searchResults = document.getElementById("searchResults");
  const selectedClientsTable = document.getElementById("selectedClientsTable");
  const emptySelected = document.getElementById("emptySelected");
  const selectedCount = document.getElementById("selectedCount");
  const savePreferencesBtn = document.getElementById("savePreferencesBtn");
  const clearAllBtn = document.getElementById("clearAllBtn");
  const testGenerateBtn = document.getElementById("testGenerateBtn");

  let selectedClients = new Map();

  // ===== LOAD MASTER CLIENTS =====
  const rawClients = JSON.parse(localStorage.getItem("clients")) || [];

  // ===== LOAD PREFS =====
  function loadPreferences() {
    const saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY));
    if (!saved || !saved.clients) return;

    selectedClients.clear();
    saved.clients.forEach(c => {
      selectedClients.set(String(c.sl), {
        sl: String(c.sl),
        name: c.name,
        amount: Number(c.amount) || 0
      });
    });

    renderTable();
  }

  // ===== SAVE PREFS =====
  function savePreferences() {
    const data = {
      clients: Array.from(selectedClients.values()),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data));
  }

  // ===== SEARCH =====
  function searchClients(q) {
    if (!q) {
      searchResults.classList.remove("active");
      return;
    }

    const res = rawClients.filter(c =>
      c.sl.toString().includes(q) ||
      c.name.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 10);

    searchResults.innerHTML = "";
    res.forEach(c => {
      const div = document.createElement("div");
      div.className = "result-item";
      div.innerHTML = `
        <div class="result-info">
          <h4>${c.name}</h4>
          <p>SL ${c.sl}</p>
        </div>
        <div class="result-actions">
          <button>Add</button>
        </div>
      `;
      div.querySelector("button").onclick = () => addClient(c);
      searchResults.appendChild(div);
    });

    searchResults.classList.add("active");
  }

  function addClient(c) {
    if (selectedClients.has(String(c.sl))) return;

    selectedClients.set(String(c.sl), {
      sl: String(c.sl),
      name: c.name,
      amount: Number(c.amount) || 0
    });

    savePreferences();
    renderTable();
  }

  // ===== RENDER =====
  function renderTable() {
    selectedClientsTable.innerHTML = "";

    if (selectedClients.size === 0) {
      emptySelected.style.display = "block";
      selectedCount.textContent = "0";
      return;
    }

    emptySelected.style.display = "none";
    selectedCount.textContent = selectedClients.size;

    [...selectedClients.values()]
      .sort((a,b)=>a.sl-b.sl)
      .forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${c.sl}</td>
          <td>${c.name}</td>
          <td>
            <input type="number" value="${c.amount}" min="0">
          </td>
          <td>
            <button class="action-btn remove">Remove</button>
          </td>
        `;

        tr.querySelector("input").oninput = e => {
          c.amount = Number(e.target.value) || 0;
          savePreferences();
        };

        tr.querySelector(".remove").onclick = () => {
          selectedClients.delete(c.sl);
          savePreferences();
          renderTable();
        };

        selectedClientsTable.appendChild(tr);
      });
  }

  // ===== EVENTS =====
  searchInput.oninput = e => searchClients(e.target.value);
  searchBtn.onclick = () => searchClients(searchInput.value);

  savePreferencesBtn.onclick = () => {
    savePreferences();
    alert("Preferences saved");
  };

  clearAllBtn.onclick = () => {
    if (confirm("Clear all preferences?")) {
      selectedClients.clear();
      savePreferences();
      renderTable();
    }
  };

  testGenerateBtn.onclick = () => {
    window.location.href = "../daily_collection/daily.html";
  };

  loadPreferences();
});
