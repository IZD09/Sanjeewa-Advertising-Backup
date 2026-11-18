/**
 * RevenueComparisonSlide
 * Extends DashboardBaseSlide.
 * Responsible for:
 * - Rendering revenue comparison data across product categories.
 * - Managing sales category line chart (salesCategoryChart) comparing current and prior year figures.
 * - Managing payment collection method distribution chart (paymentMethodsChart).
 */

import { DashboardBaseSlide } from '../DashboardBaseSlide.js';

export class RevenueComparisonSlide extends DashboardBaseSlide {
  constructor(element, options = {}) {
    super(element, options);
    this.name = 'revenue-comparison';
  }

  /**
   * Render slide content.
   * @param {Object} [data]
   */
  render(data = {}) {
    super.render(data);
  }

  /**
   * Render slide charts when slide becomes active.
   * @param {Object} [data]
   */
  renderCharts(data = {}) {
    const revenueData = data?.revenue || this.data?.revenue || {};

    // 1. Sales Category Line Chart (2 Years)
    const incomeData = revenueData.income || revenueData.categories || {};
    this.renderSalesCategoryChart(incomeData);

    // 2. Payment Methods Breakdown Doughnut Chart
    this.renderPaymentMethodsChart(revenueData.paymentMethods);
  }

  /**
   * Render or update Sales Category Line Chart (comparing 2 years: current vs previous year).
   * @param {Object} [categoriesData]
   */
  renderSalesCategoryChart(categoriesData) {
    if (!categoriesData) return;

    const labels = categoriesData.labels || [];
    const currentYearData = categoriesData.currentYearData || (Array.isArray(categoriesData.currentYear) ? categoriesData.currentYear : []);
    const prevYearData = categoriesData.previousYearData || (Array.isArray(categoriesData.previousYear) ? categoriesData.previousYear : []);
    const currentYearLabel = String(typeof categoriesData.currentYear === "number" || typeof categoriesData.currentYear === "string" ? categoriesData.currentYear : new Date().getFullYear());
    const prevYearLabel = String(typeof categoriesData.previousYear === "number" || typeof categoriesData.previousYear === "string" ? categoriesData.previousYear : new Date().getFullYear() - 1);

    this.createChart("salesCategoryChart", {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: currentYearLabel,
            data: currentYearData,
            borderColor: "#02a327ff",
            backgroundColor: "#02a32820",
            fill: true,
            tension: 0,
            borderWidth: 2.5,
            pointRadius: 2,
            pointHoverRadius: 6,
            pointBackgroundColor: "#7cfa99ff"
          },
          {
            label: prevYearLabel,
            data: prevYearData,
            borderColor: "#0400fcff",
            backgroundColor: "#0400fc19",
            fill: true,
            tension: 0,
            borderWidth: 2.5,
            pointRadius: 2,
            pointHoverRadius: 6,
            pointBackgroundColor: "#9bacffff"
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              boxWidth: 14,
              usePointStyle: true
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Render or update Payment Collections Breakdown Doughnut Chart.
   * @param {Object} [paymentData]
   */
  renderPaymentMethodsChart(paymentData) {
    const labels = paymentData?.labels || [];
    const values = paymentData?.values || [];

    const methodColorMap = {
      "cash": "#10b981",               // Emerald Green
      "bank transfer": "#2563eb",       // Royal Blue
      "credit card": "#8b5cf6",         // Purple
      "debit card": "#06b6d4",          // Cyan / Teal
      "cheque": "#f59e0b",              // Amber Orange
      "online / qr payment": "#ec4899", // Hot Pink
      "online / qr": "#ec4899",
      "online": "#ec4899",
      "qr payment": "#ec4899",
      "qr": "#ec4899"
    };

    const fallbackPalette = [
      "#10b981", // Emerald Green
      "#2563eb", // Royal Blue
      "#8b5cf6", // Purple
      "#06b6d4", // Cyan
      "#f59e0b", // Amber Orange
      "#ec4899", // Pink
      "#f97316", // Coral Orange
      "#14b8a6", // Teal
      "#6366f1", // Indigo
      "#e11d48", // Crimson
      "#84cc16", // Lime
      "#a855f7"  // Violet
    ];

    const colors = paymentData?.colors && paymentData.colors.length >= labels.length
      ? paymentData.colors
      : labels.map((label, idx) => {
          const key = String(label).toLowerCase().trim();
          return methodColorMap[key] || fallbackPalette[idx % fallbackPalette.length];
        });

    this.createChart("paymentMethodsChart", {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "55%",
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              boxWidth: 12,
              padding: 10,
              usePointStyle: true
            }
          }
        }
      }
    });
  }

  onSlideEnter() {
    super.onSlideEnter();
  }

  onSlideLeave() {
    super.onSlideLeave();
  }
}

