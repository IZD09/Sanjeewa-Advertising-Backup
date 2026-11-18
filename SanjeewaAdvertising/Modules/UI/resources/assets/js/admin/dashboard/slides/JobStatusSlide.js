/**
 * JobStatusSlide
 * Extends DashboardBaseSlide.
 * Responsible for:
 * - Rendering print shop production statistics and flow.
 * - Managing weekly output bar chart (weeklyOutputChart) in square feet.
 * - Managing media and material utilization distribution chart (materialUsageChart).
 */

import { DashboardBaseSlide } from '../DashboardBaseSlide.js';

export class JobStatusSlide extends DashboardBaseSlide {
  constructor(element, options = {}) {
    super(element, options);
    this.name = 'job-status';
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
    const jobsData = data?.jobs || this.data?.jobs || {};

    // 1. Weekly Output Bar Chart
    this.renderWeeklyOutputChart(jobsData.weeklyOutput);

    // 2. Material Usage Distribution Doughnut Chart
    this.renderMaterialUsageChart(jobsData.materialUsage);
  }

  /**
   * Render or update Weekly Output Bar Chart.
   * @param {Object} [outputData]
   */
  renderWeeklyOutputChart(outputData) {
    const labels = outputData?.labels || [];
    const values = outputData?.values || [];
    const defaultColors = [
      "#2563eb", // Mon - Blue
      "#06b6d4", // Tue - Cyan
      "#10b981", // Wed - Green
      "#f59e0b", // Thu - Amber Orange
      "#ef4444", // Fri - Red
      "#8b5cf6", // Sat - Purple
      "#ec4899"  // Sun - Pink
    ];
    const colors = outputData?.colors && outputData.colors.length > 0 ? outputData.colors : defaultColors;

    this.createChart("weeklyOutputChart", {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Square Feet",
          data: values,
          backgroundColor: colors,
          borderRadius: 6,
          maxBarThickness: 32,
          barPercentage: 0.7
        }]
      },
      options: {
        plugins: { legend: { display: false } }
      }
    });
  }

  /**
   * Render or update Material Usage Distribution Doughnut Chart.
   * @param {Object} [usageData]
   */
  renderMaterialUsageChart(usageData) {
    const labels = usageData?.labels || [];
    const values = usageData?.values || [];

    const materialColorMap = {
      "flex banner": "#2563eb",        // Royal Blue
      "sticker / vinyl": "#10b981",    // Emerald Green
      "visiting cards": "#8b5cf6",     // Purple
      "leaflets & flyers": "#f59e0b",  // Amber Orange
      "signage & backlit": "#06b6d4",  // Cyan
      "custom printing": "#ec4899",    // Hot Pink / Magenta
      "banner": "#2563eb",
      "sticker": "#10b981",
      "vinyl": "#10b981"
    };

    const fallbackPalette = [
      "#2563eb", // Royal Blue
      "#10b981", // Emerald Green
      "#8b5cf6", // Purple
      "#f59e0b", // Amber Orange
      "#06b6d4", // Cyan
      "#ec4899", // Hot Pink
      "#f97316", // Coral Orange
      "#14b8a6", // Teal
      "#6366f1", // Indigo
      "#e11d48", // Crimson
      "#84cc16", // Lime
      "#a855f7"  // Violet
    ];

    const colors = usageData?.colors && usageData.colors.length >= labels.length
      ? usageData.colors
      : labels.map((label, idx) => {
          const key = String(label).toLowerCase().trim();
          return materialColorMap[key] || fallbackPalette[idx % fallbackPalette.length];
        });

    this.createChart("materialUsageChart", {
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
        cutout: "0%",
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

