
const clientSearchInput = document.getElementById("clientSearchInput");
const clientTable = document.getElementById("clientTableMain");
const clientRows = clientTable.querySelectorAll("tbody tr");
const clientResultCount = document.getElementById("clientResultCount");

const clientTotalRows = clientRows.length;

clientSearchInput.addEventListener("keyup", () => {
  const filter = clientSearchInput.value.toLowerCase();
  let visible = 0;

  clientRows.forEach(row => {
    const text = row.innerText.toLowerCase();
    if (text.includes(filter)) {
      row.style.display = "";
      visible++;
    } else {
      row.style.display = "none";
    }
  });

  clientResultCount.textContent = `Showing ${visible} of ${clientTotalRows} entries`;
});

/* ================= RAW CLIENT DATA (SL + NAME ONLY) ================= */
const rawClientData = [
  { sl: 1, name: "Amit Sutradhar" },
  { sl: 2, name: "" },
  { sl: 3, name: "Bipul Sarkar" },
  { sl: 4, name: "Sunil Barman" },
  { sl: 5, name: "Sanjay Roy" },
  { sl: 6, name: "Bijoy Roy" },
  { sl: 7, name: "Subrata Barman" },
  { sl: 8, name: "Dilip Sarkar" },
  { sl: 9, name: "Niranjan Mandal" },
  { sl: 10, name: "Krishna Barman" },
  { sl: 11, name: "Amit" },
  { sl: 12, name: "Apu Sarakr" },
  { sl: 13, name: "Santosh Biswas" },
  { sl: 14, name: "" },
  { sl: 15, name: "Sephali Debsharma" },
  { sl: 16, name: "Tarani Shil" },
  { sl: 17, name: "" },
  { sl: 18, name: "" },
  { sl: 19, name: "Jibon Kumar Barman" },
  { sl: 20, name: "" },
  { sl: 21, name: "" },
  { sl: 22, name: "" },
  { sl: 23, name: "Sujon Barman" },
  { sl: 24, name: "" },
  { sl: 25, name: "Raju Modok" },
  { sl: 26, name: "Madan Sarkar" },
  { sl: 27, name: "Dhiman Sutradhar" },
  { sl: 28, name: "Prodip Sutradhar" },
  { sl: 29, name: "" },
  { sl: 30, name: "Jayanti Roy" },
  { sl: 31, name: "" },
  { sl: 32, name: "Dayamay Sutradhar" },
  { sl: 33, name: "Moushumi Roy" },
  { sl: 34, name: "Govindo Sutradhar" },
  { sl: 35, name: "" },
  { sl: 36, name: "" },
  { sl: 37, name: "Abaidur Rahaman" },
  { sl: 38, name: "" },
  { sl: 39, name: "" },
  { sl: 40, name: "" },
  { sl: 41, name: "" },
  { sl: 42, name: "Mukta Sutradhar" },
  { sl: 43, name: "Subrata Roy" },
  { sl: 44, name: "" },
  { sl: 45, name: "" },
  { sl: 46, name: "Alpana Sarkar Barman" },
  { sl: 47, name: "Susama Sutradhar" },
  { sl: 48, name: "Beli Barman" },
  { sl: 49, name: "Kamal Debnath" },
  { sl: 50, name: "" },
  { sl: 51, name: "Bhim Sarkar" },
  { sl: 52, name: "" },
  { sl: 53, name: "Ranjit Barman" },
  { sl: 54, name: "" },
  { sl: 55, name: "Nitai Chaki" },
  { sl: 56, name: "" },
  { sl: 57, name: "MD. Mohaalam" },
  { sl: 58, name: "Bishnu Roy" },
  { sl: 59, name: "Gobindo Barman" },
  { sl: 60, name: "Gunadhar Sutradhar" },
  { sl: 61, name: "" },
  { sl: 62, name: "" },
  { sl: 63, name: "Sabita Sutradhar" },
  { sl: 64, name: "" },
  { sl: 65, name: "Khokon Sarkar" },
  { sl: 66, name: "" },
  { sl: 67, name: "" },
  { sl: 68, name: "" },
  { sl: 69, name: "" },
  { sl: 70, name: "Sri Ram Prodhan" },
  { sl: 71, name: "" },
  { sl: 72, name: "" },
  { sl: 73, name: "Sanjit Das" },
  { sl: 74, name: "" },
  { sl: 75, name: "Jharna Sarkar" },
  { sl: 76, name: "Gopal Sarkar" },
  { sl: 77, name: "" },
  { sl: 78, name: "Debasish Debnath" },
  { sl: 79, name: "Sobha Sutradhar" },
  { sl: 80, name: "Moni Roy" },
  { sl: 81, name: "" },
  { sl: 82, name: "" },
  { sl: 83, name: "" },
  { sl: 84, name: "Laxmi Sarkar" },
  { sl: 85, name: "Rajesh Roy" },
  { sl: 86, name: "Bikahs Sarkar" },
  { sl: 87, name: "Bishambar Sarkar" },
  { sl: 88, name: "" },
  { sl: 89, name: "" },
  { sl: 90, name: "Sanjay Sarkar" },
  { sl: 91, name: "" },
  { sl: 92, name: "Porimol Sutradhar" },
  { sl: 93, name: "" },
  { sl: 94, name: "Mukul Roy" },
  { sl: 95, name: "Nayan Prodhan" },
  { sl: 96, name: "Prodip Roy" },
  { sl: 97, name: "Shibnath Sarkar" },
  { sl: 98, name: "" },
  { sl: 99, name: "Pankaj Roy" },
  { sl: 100, name: "Manik Sutradhar" },
  { sl: 101, name: "Subir Das" },
  { sl: 102, name: "" },
  { sl: 103, name: "Tushar Kanti Roy" },
  { sl: 104, name: "" },
  { sl: 105, name: "Kanak Karmakar" },
  { sl: 106, name: "Palash Roy" },
  { sl: 107, name: "" },
  { sl: 108, name: "Hem Chandra Barman" },
  { sl: 109, name: "Babita Barman" },
  { sl: 110, name: "" },
  { sl: 111, name: "Dipankar Barman" },
  { sl: 112, name: "" },
  { sl: 113, name: "" },
  { sl: 114, name: "Goutam Sutradhar" },
  { sl: 115, name: "" },
  { sl: 116, name: "Anamika Sutradhar" },
  { sl: 117, name: "Pankaj Roy(bijoy)" },
  { sl: 118, name: "Amenul Hossen" },
  { sl: 119, name: "" },
  { sl: 120, name: "Dilip Barman" },
  { sl: 121, name: "" },
  { sl: 122, name: "Ratna Sarkar" },
  { sl: 123, name: "Karno Sarkar" },
  { sl: 124, name: "Mona Sarkar" },
  { sl: 125, name: "Asit Chandra Prodhan" },
  { sl: 126, name: "Kartick Chandra Barman" },
  { sl: 127, name: "Biresh Sarkar" },
  { sl: 128, name: "" },
  { sl: 129, name: "Sochi Barman" },
  { sl: 130, name: "Kanchan Roy" },
  { sl: 131, name: "Dulal Sutradhar" },
  { sl: 132, name: "Mahadev Sutradhar" },
  { sl: 133, name: "Tapan Sutradhar" },
  { sl: 134, name: "Sanjit Sutradhar" },
  { sl: 135, name: "Lipi Roy" },
  { sl: 136, name: "Subal Sutradhar" },
  { sl: 137, name: "Ashis Sutradhar" },
  { sl: 138, name: "" },
  { sl: 139, name: "Shyamal Roy" },
  { sl: 140, name: "Tanmay Roy" },
  { sl: 141, name: "Mithu Debnath" },
  { sl: 142, name: "Ramratan Barman" },
  { sl: 143, name: "Shakti Barman" }
];

/* ================= RENDER TABLE ================= */
const tableBody = document.getElementById("clientTableBody");
const resultCount = document.getElementById("clientResultCount");

function renderTable(data) {
  tableBody.innerHTML = "";

  data.forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.sl}</td>
      <td><strong>${item.name || "-"}</strong></td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    `;

    tableBody.appendChild(tr);
  });

  resultCount.textContent = `Showing ${data.length} of ${rawClientData.length} entries`;
}

/* ================= SEARCH ================= */
document.getElementById("clientSearchInput").addEventListener("keyup", e => {
  const value = e.target.value.toLowerCase();

  const filtered = rawClientData.filter(item =>
    item.sl.toString().includes(value) ||
    item.name.toLowerCase().includes(value)
  );

  renderTable(filtered);
});

/* ================= INIT ================= */
renderTable(rawClientData);
