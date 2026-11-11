/**
 * SanjeewaAdvertising - Supplier & GRN Chart Builder
 *
 * Builds Chart.js configurations for the 3 selectable charts in Supplier & GRN:
 * 1. Supplier Purchases vs Paid vs Payable (`chartSupplierPayables`)
 * 2. GRN Purchase Share by Supplier (`chartSupplierShare`)
 * 3. Supplier Payment Settlement Completion Rate % (`chartSupplierSettlementRate`)
 */

export class SupplierGrnChartBuilder {
  constructor(themeConfig = {}) {
    this.theme = themeConfig;
  }

  buildSupplierPayablesConfig(suppliers = {}) {
    const { commonLegend, commonScaleOptions, barAnimation } = this.theme;
    return {
      type: "bar",
      data: {
        labels: suppliers.labels || [],
        datasets: [
          {
            label: "GRN Purchases",
            data: suppliers.purchases || [],
            backgroundColor: "#1677ff",
            borderRadius: 5
          },
          {
            label: "Total Paid",
            data: suppliers.paid || [],
            backgroundColor: "#10b981",
            borderRadius: 5
          },
          {
            label: "Pending Payable",
            data: suppliers.payable || [],
            backgroundColor: "#ef4444",
            borderRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: barAnimation,
        plugins: { legend: commonLegend },
        scales: commonScaleOptions
      }
    };
  }

  buildSupplierShareConfig(suppliers = {}) {
    const { isDark, commonLegend, pieAnimation } = this.theme;
    return {
      type: "doughnut",
      data: {
        labels: suppliers.labels || [],
        datasets: [
          {
            data: suppliers.purchases || [],
            backgroundColor: ["#1677ff", "#10b981", "#f59e0b", "#8b5cf6"],
            borderWidth: 2,
            borderColor: isDark ? "#111a2e" : "#ffffff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: pieAnimation,
        cutout: "60%",
        plugins: { legend: commonLegend }
      }
    };
  }

  buildSupplierSettlementRateConfig(suppliers = {}) {
    const { textColor, gridColor, barAnimation } = this.theme;
    return {
      type: "bar",
      data: {
        labels: suppliers.labels || [],
        datasets: [
          {
            label: "Settlement Completion (%)",
            data: suppliers.settlementRate || [],
            backgroundColor: ["#1677ff", "#10b981", "#059669", "#f59e0b"],
            borderRadius: 6
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        animation: barAnimation,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: { color: textColor, font: { size: 11.5 }, callback: (v) => v + "%" },
            grid: { color: gridColor }
          },
          y: {
            ticks: { color: textColor, font: { size: 11.5, weight: "600" } },
            grid: { display: false }
          }
        }
      }
    };
  }
}

export default SupplierGrnChartBuilder;
