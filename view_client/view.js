let scrollPosition = 0;

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const body = document.body;

  const isOpening = !sidebar.classList.contains("active");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

  if (isOpening) {
    // Save scroll position
    scrollPosition = window.scrollY;

    body.classList.add("sidebar-open");
    body.style.position = "fixed";
    body.style.top = `-${scrollPosition}px`;
    body.style.width = "100%";
  } else {
    // Restore scroll position
    body.classList.remove("sidebar-open");
    body.style.position = "";
    body.style.top = "";
    body.style.width = "";

    window.scrollTo(0, scrollPosition);
  }
}

function updateClientCount() {
  const rows = document.querySelectorAll("tbody tr").length;

  // Save count to localStorage
  localStorage.setItem("totalClients", rows);
}

// Run when page loads
updateClientCount();

// when data comes from addhtml it automatically adds the data to viewhtml
const table = document.getElementById("clientTable");
const countBox = document.querySelector(".client-count");

// Load saved clients
let clients = JSON.parse(localStorage.getItem("clients")) || [];

function renderTable(data) {
  table.innerHTML = "";

  data.forEach((c, index) => {

    const row = document.createElement("tr");

     // Find real index from main clients array
    const realIndex = clients.indexOf(c);

    row.innerHTML = `
      <td>${c.sl}</td>
      <td>${c.name}</td>
      <td>${c.policy}</td>
      <td>${c.date}</td>
      <td><a href="tel:${c.phone}" class="phone">${c.phone}</a></td>
      <td class="amount">₹${c.amount}</td>
      <td>${c.premiumType}</td>
      <td>
        <button class="edit-btn" onclick="editClient(${realIndex})">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>

        <button class="delete-btn" onclick="deleteClient(${realIndex})">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;

    table.appendChild(row);
  });

  countBox.textContent = `Total Clients: ${data.length}`;
}

// Initial load
renderTable(clients);

function editClient(index) {
  let client = clients[index];

  const sl = prompt("Edit SL:", client.sl);
  const name = prompt("Edit Name:", client.name);
  const policy = prompt("Edit Policy Number:", client.policy);
  const date = prompt("Edit Date (YYYY-MM-DD):", client.date);
  const phone = prompt("Edit Phone:", client.phone);
  const amount = prompt("Edit Premium Amount:", client.amount);
  const premiumType = prompt(
    "Edit Premium Type (Monthly / Quarterly / Half-Yearly / Yearly):",
    client.premiumType
  );

  if (sl !== null) client.sl = sl;
  if (name !== null) client.name = name;
  if (policy !== null) client.policy = policy;
  if (date !== null) client.date = date;
  if (phone !== null) client.phone = phone;
  if (amount !== null) client.amount = amount;
  if (premiumType !== null) client.premiumType = premiumType;

  localStorage.setItem("clients", JSON.stringify(clients));
  renderTable(clients);
}

function deleteClient(index) {
  const confirmDelete = confirm("🗑️ Are you sure you want to delete this client?");

  if (confirmDelete) {
    clients.splice(index, 1); // remove 1 item from array
    localStorage.setItem("clients", JSON.stringify(clients));
    renderTable(clients);
  }
}
