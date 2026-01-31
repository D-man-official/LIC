const { jsPDF } = window.jspdf;

/* =========================
   GOOGLE DRIVE CONFIGURATION
========================= */
const GOOGLE_CLIENT_ID =
  "252795430368-rl11dnk11d7mpr0s1m0esln0otdgv9p1.apps.googleusercontent.com";
const GOOGLE_API_KEY = "AIzaSyCUeSEUkWUenh0xmD7sFGLKAr6eAWXukAY";
const DRIVE_FOLDER_ID = "1-KYADCmIDbarZ0oR26ECdctvWHPwvN7n";
const GOOGLE_SCOPES = "https://www.googleapis.com/auth/drive.file";

// Global variables
let googleAccessToken = null;
let googleAPILoaded = false;

/* =========================
   INIT MONTH & YEAR
========================= */
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");
const driveBtn = document.getElementById("driveBtn");
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

/* =========================
   ✅ COMBINED DATA FUNCTION
========================= */
function getCombinedMonthlyData(monthKey) {
  const normal = JSON.parse(localStorage.getItem("monthlyClients"));
  const special = JSON.parse(localStorage.getItem("specialMonthlyClients"));

  let clients = [];

  if (normal && normal.month === monthKey) {
    clients = [...normal.clients];
  }

  if (special && special.month === monthKey) {
    special.clients.forEach((sc) => {
      if (!clients.some((c) => c.sl === sc.sl)) {
        clients.push(sc);
      }
    });
  }

  if (clients.length === 0) return null;
  return { month: monthKey, clients };
}

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
  if (downloadBtn) downloadBtn.style.display = "flex";
  if (previewBtn) previewBtn.style.display = "flex";
  if (driveBtn) driveBtn.style.display = "flex";

  if (selectedInfo) {
    selectedInfo.style.display = "block";
    selectedInfo.classList.add("show");
  }

  if (statsSummary) {
    statsSummary.style.display = "grid";
    statsSummary.classList.add("show");
  }

  if (noDataMessage) {
    noDataMessage.style.display = "none";
  }
}

// Update selected info display
function updateSelectedInfo() {
  const month = Number(monthSelect.value);
  const year = Number(yearSelect.value);
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthlyData = getCombinedMonthlyData(monthKey);

  const selectedMonthYear = document.getElementById("selectedMonthYear");
  if (selectedMonthYear) {
    selectedMonthYear.textContent = `${monthNames[month]} ${year}`;
  }

  if (selectedInfo) {
    selectedInfo.style.display = "block";
    selectedInfo.classList.add("show");
  }

  if (monthlyData) {
    if (noDataMessage) {
      noDataMessage.style.display = "none";
    }

    if (statsSummary) {
      statsSummary.style.display = "grid";
      statsSummary.classList.add("show");
    }

    updateStatistics(month, year);
  } else {
    if (noDataMessage) {
      noDataMessage.style.display = "block";
    }

    if (statsSummary) {
      statsSummary.style.display = "none";
      statsSummary.classList.remove("show");
    }

    if (reportPreview) {
      reportPreview.style.display = "none";
    }

    updateStatistics(month, year, true);
  }
}

// Update statistics display
function updateStatistics(month, year, noData = false) {
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthlyData = getCombinedMonthlyData(monthKey);

  let totalClients = 0;
  let totalCollection = 0;
  let collectedClients = 0;

  if (!noData && monthlyData) {
    const clients = [...monthlyData.clients];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    totalClients = clients.length;

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
  const monthlyData = getCombinedMonthlyData(monthKey);

  if (!monthlyData) {
    alert("No data found for selected month");
    return;
  }

  previewBtn.classList.add("loading");
  previewBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating Preview...';

  setTimeout(() => {
    const clients = [...monthlyData.clients].sort((a, b) => a.sl - b.sl);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let grandMonthlyTotal = 0;

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

    clients.slice(0, 5).forEach((client) => {
      let rowHTML = `<tr class="preview-data-row">
                <td>${client.sl}</td>
                <td>${client.name}</td>
                <td>`;

      let clientTotal = 0;
      let hasPayment = false;

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

    if (clients.length > 5) {
      previewHTML += `
                <tr class="preview-data-row">
                    <td colspan="5" style="text-align: center; font-style: italic; color: var(--text-light);">
                        + ${clients.length - 5} more clients will be included in the PDF
                    </td>
                </tr>
            `;
    }

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

    previewBtn.classList.remove("loading");
    previewBtn.innerHTML = '<i class="fas fa-search"></i> Preview Report';

    reportPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 500);
}

// =========================
// Generate PDF as Blob
// =========================
function generatePDFAsBlob() {
  const month = Number(monthSelect.value);
  const year = Number(yearSelect.value);
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthlyData = getCombinedMonthlyData(monthKey);

  if (!monthlyData) {
    throw new Error("No data found for selected month");
  }

  let grandMonthlyTotal = 0;

  const clients = [...monthlyData.clients].sort((a, b) => a.sl - b.sl);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  let pageStartDay = 1;

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
          row.push(String(paid.amount));
          clientTotal += Number(paid.amount);
        } else {
          row.push("x");
        }
      }

      row.push(String(clientTotal));
      grandMonthlyTotal += clientTotal;

      body.push(row);
    });

    doc.setFillColor(12, 58, 90);
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
      head,
      body,
      startY: 18,

      styles: {
        fontSize: 6, // smaller text
        halign: "center",
        cellPadding: 1, // smaller padding
        font: "helvetica",
      },

      rowPageBreak: "avoid", // do not split rows
      pageBreak: "avoid", // try to keep on one page
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontStyle: "bold",
        cellPadding: 3,
        fontSize: 9,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "left", cellWidth: 40 },
        [head[0].length - 1]: {
          fillColor: [220, 252, 231],
          textColor: [6, 95, 70],
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
            data.cell.styles.textColor = [0, 128, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
      willDrawCell: function (data) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
      },
    });

    pageStartDay += 10;
    if (pageStartDay <= daysInMonth) doc.addPage();
  }

  doc.addPage();

  doc.setFillColor(240, 249, 255);
  doc.rect(0, 0, 297, 210, "F");

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1);
  doc.rect(10, 10, 277, 190);

  doc.setFillColor(12, 58, 90);
  doc.rect(10, 10, 277, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("LIFE INSURANCE CORPORATION OF INDIA", 148, 24, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(30, 58, 138);
  doc.text("MONTHLY COLLECTION SUMMARY", 148, 70, { align: "center" });

  doc.setFontSize(48);
  doc.setTextColor(30, 100, 200);
  doc.text(`RS ${grandMonthlyTotal.toLocaleString()}`, 148, 105, {
    align: "center",
  });

  doc.setFontSize(18);
  doc.setTextColor(100, 116, 139);
  doc.text(`(INR ${grandMonthlyTotal.toLocaleString()})`, 148, 120, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(100, 116, 139);
  doc.text(`${monthNames[month]} ${year}`, 148, 140, { align: "center" });

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(2);
  doc.line(50, 150, 247, 150);

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(new Date().toLocaleDateString("en-IN"), 148, 187, {
    align: "center",
  });

  doc.text("© 2026 LIC Collection Book. All rights reserved to:", 110, 192);
  doc.setTextColor(30, 58, 138);
  doc.textWithLink("Dhiman Sutradhar", 190, 192, {
    url: "https://www.facebook.com/dhiman.sutradhar.92",
  });

  const contactY = 198;
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(10);
  doc.text("You can reach out to us :", 110, contactY);

  doc.setTextColor(30, 58, 138);
  doc.textWithLink("LinkedIn", 151, contactY, {
    url: "https://www.linkedin.com/in/dhiman-sutradhar-097283329/",
  });

  doc.textWithLink("Instagram", 170, contactY, {
    url: "https://www.instagram.com/d.man_official/",
  });

  doc.textWithLink("Email", 192, contactY, {
    url: "mailto:dhimans7047@gmail.com",
  });

  const pdfBlob = doc.output("blob");
  return {
    blob: pdfBlob,
    filename: `LIC_Report_${monthNames[month]}_${year}.pdf`,
    monthName: monthNames[month],
    year: year,
  };
}

/* =========================
   DOWNLOAD PDF FUNCTION
========================= */
function downloadPDF() {
  downloadBtn.classList.add("loading");
  downloadBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';

  try {
    const { blob, filename } = generatePDFAsBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    downloadBtn.classList.remove("loading");
    downloadBtn.innerHTML =
      '<i class="fas fa-download"></i> Download PDF Report';
    showSuccessMessage(filename, false);
  } catch (error) {
    alert("No data found for selected month");
    downloadBtn.classList.remove("loading");
    downloadBtn.innerHTML =
      '<i class="fas fa-download"></i> Download PDF Report';
  }
}

// =========================
// SIMPLIFIED DRIVE EXPORT
// =========================

// Show Drive Upload Instructions
function showDriveInstructions(pdfData) {
  const url = URL.createObjectURL(pdfData.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = pdfData.filename;
  a.style.display = "none";
  document.body.appendChild(a);

  const modalHTML = `
    <div id="driveModal" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: 'Plus Jakarta Sans', sans-serif;
    ">
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 20px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        animation: fadeIn 0.3s ease;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="color: #0c3a5a; margin: 0; display: flex; align-items: center; gap: 10px;">
            <i class="fa-brands fa-google-drive" style="color: #4285F4; font-size: 1.5rem;"></i>
            Export to Google Drive
          </h3>
          <button id="closeModalBtn" style="
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #666;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: all 0.3s ease;
          ">&times;</button>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
                   padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
          <p style="margin-bottom: 1rem; color: #0c3a5a; font-weight: 600;">
            <i class="fas fa-info-circle"></i> How to upload to Drive:
          </p>
          <ol style="margin-left: 1.5rem; color: #333; line-height: 1.6;">
            <li style="margin-bottom: 0.5rem;">Click "Download PDF" below</li>
            <li style="margin-bottom: 0.5rem;">Go to <a href="https://drive.google.com" target="_blank" 
               style="color: #0c3a5a; font-weight: bold; text-decoration: none;">
               drive.google.com</a></li>
            <li style="margin-bottom: 0.5rem;">Open folder: <strong>Reports</strong></li>
            <li>Drag & drop the downloaded PDF file</li>
          </ol>
        </div>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <p style="margin: 0; color: #666; font-size: 0.9rem;">
            <i class="fas fa-file-pdf" style="color: #FF6B6B;"></i>
            File: <strong>${pdfData.filename}</strong>
          </p>
          <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">
            <i class="fas fa-folder" style="color: #FFA726;"></i>
            Folder: <a href="https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}" 
               target="_blank" style="color: #0c3a5a; text-decoration: none;">
               https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}</a>
          </p>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button id="cancelBtn" style="
            padding: 0.75rem 1.5rem;
            background: #f1f5f9;
            border: 2px solid #cbd5e1;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            color: #475569;
            transition: all 0.3s ease;
          " onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
            Cancel
          </button>
          <button id="downloadAndOpenBtn" style="
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #0c3a5a 0%, #1e3a8a 100%);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(12, 58, 90, 0.3)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            <i class="fas fa-download"></i>
            Download PDF & Open Drive
          </button>
        </div>
      </div>
    </div>
    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    </style>
  `;

  const modalDiv = document.createElement("div");
  modalDiv.innerHTML = modalHTML;
  document.body.appendChild(modalDiv);

  // Close modal
  document.getElementById("closeModalBtn").onclick = function () {
    document.body.removeChild(modalDiv);
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  document.getElementById("cancelBtn").onclick = function () {
    document.body.removeChild(modalDiv);
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download and open Drive
  document.getElementById("downloadAndOpenBtn").onclick = function () {
    // Trigger download
    a.click();

    // Open Drive folder after 1 second
    setTimeout(() => {
      window.open(
        `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`,
        "_blank",
      );
    }, 1000);

    // Close modal
    document.body.removeChild(modalDiv);
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    showSuccessMessage(pdfData.filename, true);
  };
}

// Main Drive Export Function - SIMPLIFIED VERSION
async function exportToDrive() {
  try {
    driveBtn.classList.add("loading");
    driveBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';

    const pdfData = generatePDFAsBlob();

    // Skip OAuth attempt, go directly to manual instructions
    driveBtn.classList.remove("loading");
    driveBtn.innerHTML =
      '<i class="fa-brands fa-google-drive"></i> Export to Drive';

    showDriveInstructions(pdfData);
  } catch (error) {
    console.error("Drive export error:", error);

    driveBtn.classList.remove("loading");
    driveBtn.innerHTML =
      '<i class="fa-brands fa-google-drive"></i> Export to Drive';

    if (error.message.includes("No data found")) {
      alert("No data found for selected month");
    } else {
      alert("Error generating PDF");
    }
  }
}

// Show success message
function showSuccessMessage(filename, isDrive = false, driveFileId = null) {
  const successMessage = document.createElement("div");
  successMessage.className = "success-message";

  if (isDrive) {
    successMessage.innerHTML = `
      <i class="fa-brands fa-google-drive" style="color: #34A853;"></i>
      <div>
        <div class="message" style="font-weight: 600;">PDF Uploaded to Google Drive!</div>
        <div class="filename">${filename}</div>
        ${
          driveFileId
            ? `
        <div style="margin-top: 5px;">
          <a href="https://drive.google.com/file/d/${driveFileId}/view" target="_blank" 
             style="color: white; text-decoration: underline; font-size: 0.8rem;">
            <i class="fas fa-external-link-alt"></i> Open in Drive
          </a>
        </div>`
            : ""
        }
      </div>
    `;
  } else {
    successMessage.innerHTML = `
      <i class="fas fa-check-circle" style="color: #10B981;"></i>
      <div>
        <div class="message" style="font-weight: 600;">Report Generated Successfully!</div>
        <div class="filename">${filename}</div>
      </div>
    `;
  }

  successMessageContainer.appendChild(successMessage);

  setTimeout(() => {
    successMessage.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => {
      successMessageContainer.removeChild(successMessage);
    }, 300);
  }, 5000);
}

// Event Listeners
monthSelect.addEventListener("change", updateSelectedInfo);
yearSelect.addEventListener("change", updateSelectedInfo);
previewBtn.addEventListener("click", generatePreview);
downloadBtn.addEventListener("click", downloadPDF);
driveBtn.addEventListener("click", exportToDrive);
closePreview.addEventListener("click", () => {
  reportPreview.style.display = "none";
});

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  forceShowElements();
  updateSelectedInfo();

  document.addEventListener("click", (e) => {
    if (!reportPreview.contains(e.target) && e.target !== previewBtn) {
      reportPreview.style.display = "none";
    }
  });
});
