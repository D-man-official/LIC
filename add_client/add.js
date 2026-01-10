function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}


const form = document.getElementById("clientForm");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const client = {
    sl: document.getElementById("sl").value,
    name: document.getElementById("name").value,
    policy: document.getElementById("policy").value,
    date: document.getElementById("date").value,
    phone: document.getElementById("phone").value,
    premiumType: document.getElementById("premiumType").value,
    amount: document.getElementById("amount").value
  };

  let clients = JSON.parse(localStorage.getItem("clients")) || [];
  clients.push(client);
  localStorage.setItem("clients", JSON.stringify(clients));

  alert("✅ Client added successfully!");
  form.reset();
});