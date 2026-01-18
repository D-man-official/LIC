const { jsPDF } = window.jspdf;

/* =========================
   INIT MONTH & YEAR
========================= */
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const selectedInfo = document.getElementById("selectedInfo");
const statsSummary = document.getElementById("statsSummary");
const noDataMessage = document.getElementById("noDataMessage");
const reportPreview = document.getElementById("reportPreview");
const previewContent = document.getElementById("previewContent");
const closePreview = document.getElementById("closePreview");
const successMessageContainer = document.getElementById(
  "successMessageContainer",
);

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Initialize month dropdown
monthNames.forEach((m, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = m;
  monthSelect.appendChild(opt);
});

// Initialize year dropdown
const currentYear = new Date().getFullYear();
for (let y = currentYear - 2; y <= currentYear + 2; y++) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearSelect.appendChild(opt);
}

// Set current month and year as default
monthSelect.value = new Date().getMonth();
yearSelect.value = currentYear;

// FORCE SHOW ALL ELEMENTS ON LOAD
function forceShowElements() {
  // Always show action buttons
  if (downloadBtn) downloadBtn.style.display = "flex";
  if (previewBtn) previewBtn.style.display = "flex";

  // Always show selected info
  if (selectedInfo) {
    selectedInfo.style.display = "block";
    selectedInfo.classList.add("show");
  }

  // Always show stats summary
  if (statsSummary) {
    statsSummary.style.display = "grid";
    statsSummary.classList.add("show");
  }

  // Hide no data message by default
  if (noDataMessage) {
    noDataMessage.style.display = "none";
  }
}

// Update selected info display
function updateSelectedInfo() {
  const month = Number(monthSelect.value);
  const year = Number(yearSelect.value);
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));

  // Always update the selected month/year display
  const selectedMonthYear = document.getElementById("selectedMonthYear");
  if (selectedMonthYear) {
    selectedMonthYear.textContent = `${monthNames[month]} ${year}`;
  }

  // Always show selected info section
  if (selectedInfo) {
    selectedInfo.style.display = "block";
    selectedInfo.classList.add("show");
  }

  if (monthlyData && monthlyData.month === monthKey) {
    // Hide no data message
    if (noDataMessage) {
      noDataMessage.style.display = "none";
    }

    // Show stats summary
    if (statsSummary) {
      statsSummary.style.display = "grid";
      statsSummary.classList.add("show");
    }

    updateStatistics(month, year);
  } else {
    // Show no data message
    if (noDataMessage) {
      noDataMessage.style.display = "block";
    }

    // Hide stats summary
    if (statsSummary) {
      statsSummary.style.display = "none";
      statsSummary.classList.remove("show");
    }

    // Hide report preview
    if (reportPreview) {
      reportPreview.style.display = "none";
    }

    // Still update statistics with zero values
    updateStatistics(month, year, true);
  }
}

// Update statistics display
function updateStatistics(month, year, noData = false) {
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));

  let totalClients = 0;
  let totalCollection = 0;
  let collectedClients = 0;

  if (!noData && monthlyData && monthlyData.month === monthKey) {
    const clients = [...monthlyData.clients];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    totalClients = clients.length;

    // Calculate collection for each client
    clients.forEach((client) => {
      let clientCollected = false;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = new Date(Date.UTC(year, month, day))
          .toISOString()
          .split("T")[0];

        const payments =
          JSON.parse(localStorage.getItem(`payment-${dateKey}`)) || [];
        const paid = payments.find((p) => p.sl === client.sl);

        if (paid) {
          totalCollection += Number(paid.amount);
          clientCollected = true;
        }
      }

      if (clientCollected) {
        collectedClients++;
      }
    });
  }

  const collectionRate =
    totalClients > 0 ? Math.round((collectedClients / totalClients) * 100) : 0;

  // Update DOM with RS instead of ₹
  const totalClientsEl = document.getElementById("totalClients");
  const totalCollectionEl = document.getElementById("totalCollection");
  const collectionRateEl = document.getElementById("collectionRate");

  if (totalClientsEl) totalClientsEl.textContent = totalClients;
  if (totalCollectionEl)
    totalCollectionEl.textContent = `RS ${totalCollection.toLocaleString()}`;
  if (collectionRateEl) collectionRateEl.textContent = `${collectionRate}%`;
}

// Generate preview
function generatePreview() {
  const month = Number(monthSelect.value);
  const year = Number(yearSelect.value);
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));

  if (!monthlyData || monthlyData.month !== monthKey) {
    alert("No data found for selected month");
    return;
  }

  // Show loading state
  previewBtn.classList.add("loading");
  previewBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating Preview...';

  setTimeout(() => {
    const clients = [...monthlyData.clients].sort((a, b) => a.sl - b.sl);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let grandMonthlyTotal = 0;

    // Create preview table
    let previewHTML = `
            <div class="pdf-preview">
                <div class="pdf-preview-header">
                    <h4>LIC Monthly Report Preview</h4>
                    <p>${monthNames[month]} ${year} - ${clients.length} Clients</p>
                </div>
                
                <div class="pdf-preview-stats">
                    <div class="pdf-preview-stat">
                        <div class="label">Total Days</div>
                        <div class="value">${daysInMonth}</div>
                    </div>
                    <div class="pdf-preview-stat">
                        <div class="label">Total Clients</div>
                        <div class="value">${clients.length}</div>
                    </div>
                    <div class="pdf-preview-stat">
                        <div class="label">Report Pages</div>
                        <div class="value">${Math.ceil(daysInMonth / 10)}</div>
                    </div>
                </div>
                
                <div class="preview-table-container">
                    <table class="preview-table">
                        <thead>
                            <tr class="preview-header-row">
                                <th>SL</th>
                                <th>CLIENT NAME</th>
                                <th>Day 1-10</th>
                                <th>Status</th>
                                <th>Client Total</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

    // Add first 5 clients as preview
    clients.slice(0, 5).forEach((client) => {
      let rowHTML = `<tr class="preview-data-row">
                <td>${client.sl}</td>
                <td>${client.name}</td>
                <td>`;

      let clientTotal = 0;
      let hasPayment = false;

      // Check first 10 days
      for (let day = 1; day <= 10 && day <= daysInMonth; day++) {
        const dateKey = new Date(Date.UTC(year, month, day))
          .toISOString()
          .split("T")[0];

        const payments =
          JSON.parse(localStorage.getItem(`payment-${dateKey}`)) || [];
        const paid = payments.find((p) => p.sl === client.sl);

        if (paid) {
          hasPayment = true;
          clientTotal += Number(paid.amount);
        }
      }

      rowHTML += hasPayment
        ? `<span class="amount-paid">RS ${clientTotal.toLocaleString()}</span>`
        : '<span class="amount-pending">Pending</span>';

      rowHTML += `</td>
                <td>
                    <span class="status ${hasPayment ? "collected" : "pending"}">
                        ${hasPayment ? "Collected" : "Pending"}
                    </span>
                </td>
                <td><strong>RS ${clientTotal.toLocaleString()}</strong></td>
            </tr>`;

      previewHTML += rowHTML;
      grandMonthlyTotal += clientTotal;
    });

    // Add remaining clients count
    if (clients.length > 5) {
      previewHTML += `
                <tr class="preview-data-row">
                    <td colspan="5" style="text-align: center; font-style: italic; color: var(--text-light);">
                        + ${clients.length - 5} more clients will be included in the PDF
                    </td>
                </tr>
            `;
    }

    // Add grand total row
    previewHTML += `
            <tr class="preview-total">
                <td colspan="4" style="text-align: right;">Grand Total:</td>
                <td><strong>RS ${grandMonthlyTotal.toLocaleString()}</strong></td>
            </tr>
        `;

    previewHTML += `
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 1.5rem; padding: 1rem; background: var(--light-bg); border-radius: 8px; font-size: 0.9rem; color: var(--text-light);">
                    <p><i class="fas fa-info-circle"></i> <strong>PDF Report Details:</strong></p>
                    <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                        <li>Complete monthly report with ${daysInMonth} days tracking</li>
                        <li>Organized in daily collection tables (10 days per page)</li>
                        <li>Includes final grand total page with summary</li>
                        <li>Professional formatting with LIC branding</li>
                    </ul>
                </div>
            </div>
        `;

    previewContent.innerHTML = previewHTML;
    reportPreview.style.display = "block";

    // Reset button
    previewBtn.classList.remove("loading");
    previewBtn.innerHTML = '<i class="fas fa-search"></i> Preview Report';

    // Scroll to preview
    reportPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 500);
}

/* =========================
   MAIN PDF FUNCTION
========================= */
function downloadPDF() {
  // Show loading state
  downloadBtn.classList.add("loading");
  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';

  // 🔴 VERY IMPORTANT: reset every time
  let grandMonthlyTotal = 0;

  const month = Number(monthSelect.value);
  const year = Number(yearSelect.value);

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthlyData = JSON.parse(localStorage.getItem("monthlyClients"));

  if (!monthlyData || monthlyData.month !== monthKey) {
    alert("No data found for selected month");
    downloadBtn.classList.remove("loading");
    downloadBtn.innerHTML =
      '<i class="fas fa-download"></i> Download PDF Report';
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

    const head = [
      [
        "SL",
        "CLIENT NAME",
        ...Array.from(
          { length: pageEndDay - pageStartDay + 1 },
          (_, i) => pageStartDay + i,
        ),
        "TOTAL",
      ],
    ];

    const body = [];

    clients.forEach((client) => {
      let row = [client.sl, client.name];
      let clientTotal = 0;

      for (let day = pageStartDay; day <= pageEndDay; day++) {
        const dateKey = new Date(Date.UTC(year, month, day))
          .toISOString()
          .split("T")[0];

        const payments =
          JSON.parse(localStorage.getItem(`payment-${dateKey}`)) || [];
        const paid = payments.find((p) => p.sl === client.sl);

        if (paid) {
          row.push(String(paid.amount)); // ✅ number only
          clientTotal += Number(paid.amount);
        } else {
          row.push("Pending");
        }
      }

      row.push(String(clientTotal)); // ✅ row total
      grandMonthlyTotal += clientTotal; // ✅ grand total add

      body.push(row);
    });

    // Add header with LIC branding
    doc.setFillColor(12, 58, 90); // Dark blue for LIC
    doc.rect(0, 0, 297, 15, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`LIC INSURANCE - MONTHLY COLLECTION REPORT`, 148, 9, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.text(
      `${monthNames[month]} ${year} (Days ${pageStartDay}-${pageEndDay})`,
      148,
      13,
      { align: "center" },
    );
    doc.setTextColor(0, 0, 0);

    doc.autoTable({
      head,
      body,
      startY: 20,
      styles: {
        fontSize: 8,
        halign: "center",
        cellPadding: 2,
        font: "helvetica",
      },
      headStyles: {
        fillColor: [30, 58, 138], // Blue
        textColor: 255,
        fontStyle: "bold",
        cellPadding: 3,
        fontSize: 9,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "left", cellWidth: 40 },
        [head[0].length - 1]: {
          fillColor: [220, 252, 231], // Light green
          textColor: [6, 95, 70], // Dark green
          fontStyle: "bold",
          fontSize: 9,
        },
      },
      didParseCell(data) {
        if (data.cell.text[0] === "Pending") {
          data.cell.styles.textColor = [120, 120, 120];
          data.cell.styles.fontStyle = "italic";
        }
        if (
          data.section === "body" &&
          data.column.index >= 2 &&
          data.column.index < head[0].length - 1
        ) {
          if (data.cell.text[0] !== "Pending") {
            data.cell.styles.textColor = [0, 128, 0]; // Green for paid amounts
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      willDrawCell: function (data) {
        // Add border to all cells
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
      },
    });

    pageStartDay += 10;
    if (pageStartDay <= daysInMonth) doc.addPage();
  }

  /* =========================
       FINAL GRAND TOTAL PAGE (WITH RS/INR FORMATTING)
    ========================= */
  doc.addPage();

  // Add decorative background
  doc.setFillColor(240, 249, 255);
  doc.rect(0, 0, 297, 210, "F");

  // Add decorative border
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1);
  doc.rect(10, 10, 277, 190);

  // Add LIC logo/title at top
  doc.setFillColor(12, 58, 90);
  doc.rect(10, 10, 277, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("LIFE INSURANCE CORPORATION OF INDIA", 148, 24, { align: "center" });

  // Reset text color for main content
  doc.setTextColor(0, 0, 0);

  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(30, 58, 138);
  doc.text("MONTHLY COLLECTION SUMMARY", 148, 70, { align: "center" });

  // Add total amount with RS prefix (not ₹)
  doc.setFontSize(48);
  doc.setTextColor(30, 100, 200);
  doc.text(`RS ${grandMonthlyTotal.toLocaleString()}`, 148, 105, {
    align: "center",
  });

  // Add INR as subtitle
  doc.setFontSize(18);
  doc.setTextColor(100, 116, 139);
  doc.text(`(INR ${grandMonthlyTotal.toLocaleString()})`, 148, 120, {
    align: "center",
  });

  // Add month/year
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(100, 116, 139);
  doc.text(`${monthNames[month]} ${year}`, 148, 140, { align: "center" });

  // Add decorative line
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(2);
  doc.line(50, 150, 247, 150);

  // Add footer
  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);

  // Line 1
 

  // Line 2 (date)
  doc.text(new Date().toLocaleDateString("en-IN"), 148, 187, {
    align: "center",
  });

  // Line 3 (credit text - normal part)
  doc.text("© 2026 LIC Collection Book. All rights reserved to", 110, 192);

  // Line 4 (CLICKABLE NAME)
  doc.setTextColor(30, 58, 138); // blue link color
  doc.textWithLink("Dhiman Sutradhar", 195, 192, {
    url: "https://www.linkedin.com/in/dhiman-sutradhar-097283329/",
  });

  // Reset color
  doc.setTextColor(150, 150, 150);

  // Line 5 (page number)
  doc.text(
    `Page: ${Math.ceil(daysInMonth / 10) + 1} of ${Math.ceil(daysInMonth / 10) + 1}`,
    148,
    198,
    { align: "center" },
  );

  const filename = `LIC_Report_${monthNames[month]}_${year}.pdf`;
  doc.save(filename);

  // Reset button
  downloadBtn.classList.remove("loading");
  downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF Report';

  // Show success message
  showSuccessMessage(filename);
}

// Show success message
function showSuccessMessage(filename) {
  const successMessage = document.createElement("div");
  successMessage.className = "success-message";
  successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div>
            <div class="message">Report Generated Successfully!</div>
            <div class="filename">${filename}</div>
        </div>
    `;

  successMessageContainer.appendChild(successMessage);

  // Remove message after 3 seconds
  setTimeout(() => {
    successMessage.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => {
      successMessageContainer.removeChild(successMessage);
    }, 300);
  }, 3000);
}

// Event Listeners
monthSelect.addEventListener("change", updateSelectedInfo);
yearSelect.addEventListener("change", updateSelectedInfo);
previewBtn.addEventListener("click", generatePreview);
downloadBtn.addEventListener("click", downloadPDF);
closePreview.addEventListener("click", () => {
  reportPreview.style.display = "none";
});

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  // Force show all elements first
  forceShowElements();

  // Then update with actual data
  updateSelectedInfo();

  // Add click outside to close preview
  document.addEventListener("click", (e) => {
    if (!reportPreview.contains(e.target) && e.target !== previewBtn) {
      reportPreview.style.display = "none";
    }
  });
});
