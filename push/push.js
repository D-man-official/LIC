


const rawClientData = [ 
  { sl:1, name:"Amit Sutradhar", policyNo:"LIC-AS-0001", doc:"12-04-2024", tableNo:"T-01", premium:"₹1,500", premiumType:"Monthly", sumAsset:"₹5,00,000" },
  { sl:2, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:3, name:"Bipul Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:4, name:"Sunil Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-"},
  { sl:5, name:"Sanjay Roy", policyNo:"458016091", doc:"26/05/2014", tableNo:"814/12", premium:"- ", premiumType :"Quarterly" , sumAsset :"200,000"},
  { sl:6, name:"Bijoy Roy", policyNo:"458016302", doc:"28/05/2014", tableNo:"814/15", premium:"-", premiumType:"Quarterly", sumAsset:"10,00,000" },
  { sl:7, name:"Subrata Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:8, name:"Dilip Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:9, name:"Niranjan Mandal", policyNo:"458016096", doc:"26/05/2014", tableNo:"-814/17", premium:"-", premiumType:"Quarterly", sumAsset:"100,000" },
  { sl:10, name:"Krishna Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:11, name:"Amit", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:12, name:"Apu Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:13, name:"Santosh Biswas", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:14, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:15, name:"Sephali Debsharma", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:16, name:"Tarani Shil", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:17, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:18, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:19, name:"Jibon Kumar Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:20, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:21, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:22, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:23, name:"Sujon Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:24, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:25, name:"Raju Modok", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:26, name:"Madan Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:27, name:"Dhiman Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:28, name:"Prodip Sutradhar", policyNo:"456960313", doc:"28/03/2014", tableNo:"814/17", premium:"", premiumType:"Half-Yearly", sumAsset:"200,000" },
  { sl:29, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:30, name:"Jayanti Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:31, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:32, name:"Dayamay Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:33, name:"Moushumi Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:34, name:"Gobinda Sutradhar", policyNo:"456960311", doc:"28/3/2014", tableNo:"814/18", premium:"-", premiumType:"Half-Yearly", sumAsset:"200,000" },
  { sl:35, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:36, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:37, name:"Abaidur Rahaman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:38, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:39, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:40, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:41, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:42, name:"Mukta Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:43, name:"Subrata Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:44, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:45, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:46, name:"Alpana Sarkar Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:47, name:"Sushama Sutradhar", policyNo:"458016089", doc:"26/05/2014", tableNo:"814/16", premium:"-", premiumType:"Half-Yearly", sumAsset:"100,000" },
  { sl:48, name:"Beli Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:49, name:"Kamal Debnath", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:50, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:51, name:"Bhim Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:52, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:53, name:"Ranjit Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:54, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:55, name:"Nitai Chaki", policyNo:"456960489", doc:"28/03/2014", tableNo:"814/21", premium:"-", premiumType:"Half-Yearly", sumAsset:"100,000" },

  { sl:56, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:57, name:"MD. Mohaalam", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:58, name:"Bishnu Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:59, name:"Gobindo Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:60, name:"Gunadhar Sutradhar",policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:61, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:62, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:63, name:"Sabita Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:64, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:65, name:"Khokon Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:66, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:67, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:68, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:69, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:70, name:"Sri Ram Prodhan", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:71, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:72, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:73, name:"Sanjit Das", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:74, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:75, name:"Jharna Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:76, name:"Gopal Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:77, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:78, name:"Debasish Debnath", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:79, name:"Sobha Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:80, name:"Moni Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:81, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:82, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:83, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:84, name:"Laxmi Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:85, name:"Rajesh Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:86, name:"Bikahs Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:87, name:"Bishambar Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:88, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:89, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:90, name:"Sanjay Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:91, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:92, name:"Porimol Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:93, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:94, name:"Mukul Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:95, name:"Nayan Prodhan", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:96, name:"Prodip Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:97, name:"Shibnath Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:98, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:99, name:"Pankaj Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:100, name:"Manik Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:101, name:"Subir Das", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:102, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:103, name:"Tushar Kanti Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:104, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:105, name:"Kanak Karmakar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:106, name:"Palash Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:107, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:108, name:"Hem Chandra Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:109, name:"Babita Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:110, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:111, name:"Dipankar Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:112, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:113, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:114, name:"Goutam Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:115, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:116, name:"Anamika Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:117, name:"Pankaj Roy(bijoy)", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:118, name:"Amenul Hossen", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:119, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:120, name:"Dilip Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:121, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:122, name:"Ratna Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:123, name:"Karno Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:124, name:"Mona Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:125, name:"Asit Chandra Prodhan", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:126, name:"Kartick Chandra Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:127, name:"Biresh Sarkar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:128, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:129, name:"Sochi Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:130, name:"Kanchan Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:131, name:"Dulal Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:132, name:"Mahadev Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:133, name:"Tapan Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:134, name:"Sanjit Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:135, name:"Lipi Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:136, name:"Subal Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:137, name:"Ashis Sutradhar", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:138, name:"-", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:139, name:"Shyamal Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:140, name:"Tanmay Roy", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },

  { sl:141, name:"Mithu Debnath", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:142, name:"Ramratan Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" },
  { sl:143, name:"Shakti Barman", policyNo:"-", doc:"-", tableNo:"-", premium:"-", premiumType:"-", sumAsset:"-" }
];



document.addEventListener("DOMContentLoaded", () => {
  const slInput = document.getElementById("sl");
  const nameInput = document.getElementById("name");
  const form = document.getElementById("clientForm");

  /* ===== Temporary Monthly List (future-ready) ===== */
  const monthlyClientList = [];

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
      div.innerHTML = `<strong>${client.sl}</strong> - ${client.name}`;

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

    const matches = rawClientData.filter(client =>
      client.sl.toString().includes(value) ||
      client.name.toLowerCase().includes(value.toLowerCase())
    );

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

  const client = rawClientData.find(
    c => c.sl.toString() === sl || c.name.toLowerCase() === name.toLowerCase()
  );

  if (!client) {
    alert("Client not found in master list");
    return;
  }

  

  const now = new Date();
const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

let monthlyData =
  JSON.parse(localStorage.getItem("monthlyClients"));

if (!monthlyData || monthlyData.month !== currentMonth) {
  monthlyData = {
    month: currentMonth,
    clients: []
  };
}

const alreadyExists = monthlyData.clients.some(
  c => c.sl === client.sl
);

if (alreadyExists) {
  alert("This client is already added for this month");
  return;
}




monthlyData.clients.push({
  sl: client.sl,
  name: client.name,
  amount: Number(amount)
});

localStorage.setItem("monthlyClients", JSON.stringify(monthlyData));

alert("Client added to Monthly List");

form.reset();
suggestionBox.style.display = "none";
});
});