const { jsPDF } = window.jspdf;

/* =========================
   INIT MONTH & YEAR
========================= */
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

monthNames.forEach((m, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = m;
  monthSelect.appendChild(opt);
});

const currentYear = new Date().getFullYear();
for (let y = currentYear - 2; y <= currentYear + 2; y++) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearSelect.appendChild(opt);
}

monthSelect.value = new Date().getMonth();
yearSelect.value = currentYear;

/* =========================
   MAIN PDF FUNCTION
========================= */
function downloadPDF() {

  // 🔴 VERY IMPORTANT: reset every time
  let grandMonthlyTotal = 0;

  const month = Number(monthSelect.value);
  const year = Number(yearSelect.value);

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));

  if (!monthlyData || monthlyData.month !== monthKey) {
    alert("No data found for selected month");
    return;
  }

  const clients = [...monthlyData.clients].sort((a, b) => a.sl - b.sl);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  let pageStartDay = 1;

  /* =========================
     DAY-WISE PAGES
  ========================= */
  while (pageStartDay <= daysInMonth) {

    const pageEndDay = Math.min(pageStartDay + 9, daysInMonth);

    const head = [[
      "SL",
      "CLIENT NAME",
      ...Array.from(
        { length: pageEndDay - pageStartDay + 1 },
        (_, i) => pageStartDay + i
      ),
      "TOTAL"
    ]];

    const body = [];

    clients.forEach(client => {

      let row = [client.sl, client.name];
      let clientTotal = 0;

      for (let day = pageStartDay; day <= pageEndDay; day++) {

        const dateKey = new Date(Date.UTC(year, month, day))
          .toISOString()
          .split("T")[0];

        const payments =
          JSON.parse(localStorage.getItem(`payment-${dateKey}`)) || [];

        const paid = payments.find(p => p.sl === client.sl);

        if (paid) {
          row.push(String(paid.amount));   // ✅ number only
          clientTotal += Number(paid.amount);
        } else {
          row.push("Pending");
        }
      }

      row.push(String(clientTotal));       // ✅ row total
      grandMonthlyTotal += clientTotal;    // ✅ grand total add

      body.push(row);
    });

    doc.text(
      `LIC Monthly Report – ${monthNames[month]} ${year} (Days ${pageStartDay}-${pageEndDay})`,
      14,
      12
    );

    doc.autoTable({
      head,
      body,
      startY: 18,
      styles: {
        fontSize: 8,
        halign: "center",
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { halign: "left", cellWidth: 35 },
        [head[0].length - 1]: {
          fillColor: [200, 255, 220],
          textColor: 20,
          fontStyle: "bold",
        }
      },
      didParseCell(data) {
        if (data.cell.text[0] === "Pending") {
          data.cell.styles.textColor = [120, 120, 120];
        }
      }
    });

    pageStartDay += 10;
    if (pageStartDay <= daysInMonth) doc.addPage();
  }

  /* =========================
     FINAL GRAND TOTAL PAGE
  ========================= */
  doc.addPage();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("MONTHLY TOTAL", 148, 70, { align: "center" });

  doc.setFontSize(38);
  doc.text(String(grandMonthlyTotal), 148, 95, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(
    `${monthNames[month]} ${year}`,
    148,
    115,
    { align: "center" }
  );

  doc.save(`LIC_Report_${monthNames[month]}_${year}.pdf`);
}
