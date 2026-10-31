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
    this.renderSalesCategoryChart(revenueData.categories);

    // 2. Payment Methods Breakdown Doughnut Chart
    this.renderPaymentMethodsChart(revenueData.paymentMethods);
  }

  /**
   * Render or update Sales Category Line Chart (comparing 2 years: current vs previous year).
   * @param {Object} [categoriesData]
   */
  renderSalesCategoryChart(categoriesData) {
    const labels = categoriesData?.labels || ["Flex", "Vinyl", "Rollup", "Cards", "Leaflets", "Rigid"];
    const currentYearData = categoriesData?.currentYear || [340, 260, 180, 120, 95, 65];
    const prevYearData = categoriesData?.previousYear || [280, 210, 140, 90, 70, 50];

    this.createChart("salesCategoryChart", {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "2026",
            data: currentYearData,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.12)",
            fill: true,
            tension: 0.38,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#2563eb"
          },
          {
            label: "2025",
            data: prevYearData,
            borderColor: "#f97316",
            backgroundColor: "rgba(249, 115, 22, 0.08)",
            fill: true,
            tension: 0.38,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#f97316"
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
    const labels = paymentData?.labels || ["Cash", "Card", "Bank Transfer", "Online / QR", "Cheque"];
    const values = paymentData?.values || [38, 26, 20, 11, 5];

    this.createChart("paymentMethodsChart", {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ["#10b981", "#2563eb", "#8b5cf6", "#f59e0b", "#64748b"],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        cutout: "66%"
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

