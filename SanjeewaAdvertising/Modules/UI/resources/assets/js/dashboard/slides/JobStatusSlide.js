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
   * Render slide charts and content.
   * @param {Object} [data]
   */
  render(data = {}) {
    super.render(data);

    const jobsData = data.jobs || {};

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
    const labels = outputData?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = outputData?.values || [1240, 1680, 1450, 2100, 2480, 1950, 850];

    this.createChart("weeklyOutputChart", {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Square Feet",
          data: values,
          backgroundColor: "#ef4444",
          borderRadius: 5
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
    const labels = usageData?.labels || ["Frontlit", "Star Flex", "Glossy", "Matte", "Backlit"];
    const values = usageData?.values || [42, 24, 18, 10, 6];

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

