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
      "#0ea5e9", // Tue - Sky Blue
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

    this.createChart("materialUsageChart", {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ["#2563eb", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6"],
          borderWidth: 0
        }]
      },
      options: {
        cutout: "65%"
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

