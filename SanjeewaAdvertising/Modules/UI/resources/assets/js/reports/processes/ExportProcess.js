/**
 * SanjeewaAdvertising - Reports Export Process
 *
 * Handles CSV export of the active report tab table and Print/PDF report output.
 */

export class ExportProcess {
  /**
   * @param {Object} [context={}]
   * @param {Function} [context.showToast]
   */
  constructor(context = {}) {
    this.ctx = context;
  }

  bindEvents() {
    const btnExportCSV = document.getElementById("btnExportReportCSV");
    const btnPrintPDF = document.getElementById("btnPrintReportPDF");

    if (btnExportCSV) {
      btnExportCSV.addEventListener("click", () => this.exportActiveTableToCSV());
    }

    if (btnPrintPDF) {
      btnPrintPDF.addEventListener("click", () => this.printReportPDF());
    }
  }

  exportActiveTableToCSV() {
    const activePane = document.querySelector(".rep-tab-pane.active");
    if (!activePane) return;

    const table = activePane.querySelector("table");
    if (!table) {
      if (this.ctx.showToast) {
        this.ctx.showToast("No tabular data found in the current report view to export.", "warning");
      }
      return;
    }

    let csvContent = "";
    const rows = table.querySelectorAll("tr");

    rows.forEach((row) => {
      if (row.style.display === "none") return;
      const cols = row.querySelectorAll("th, td");
      const rowData = [];
      cols.forEach((col) => {
        const text = col.innerText.replace(/"/g, '""').trim();
        rowData.push(`"${text}"`);
      });
      csvContent += rowData.join(",") + "\r\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const title = activePane.id || "report";
    link.setAttribute("href", url);
    link.setAttribute("download", `Sanjeewa_Printing_${title}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (this.ctx.showToast) {
      this.ctx.showToast("Report exported successfully to CSV!");
    }
  }

  printReportPDF() {
    window.print();
  }
}

export default ExportProcess;
