/**
 * StockCategoriesSlide
 * Extends DashboardBaseSlide.
 * Responsible for:
 * - Rendering raw material inventory and stock health status.
 * - Managing warehouse media rolls stock level chart (stockLevelsChart).
 * - Updating live alert progress bars and remaining stock capacity metrics.
 */

import { DashboardBaseSlide } from '../DashboardBaseSlide.js';

export class StockCategoriesSlide extends DashboardBaseSlide {
  constructor(element, options = {}) {
    super(element, options);
    this.name = 'stock-categories';
  }

  /**
   * Render slide metrics.
   * @param {Object} [data]
   */
  render(data = {}) {
    super.render(data);

    const stockData = data.stock || {};

    // Update stock health metrics in DOM if data provided
    this.updateStockHealth(stockData.health);
  }

  /**
   * Render charts when slide becomes active.
   * @param {Object} [data]
   */
  renderCharts(data = {}) {
    const stockData = data?.stock || this.data?.stock || {};

    // Stock Levels Bar Chart
    this.renderStockLevelsChart(stockData.levels);
  }

  /**
   * Update stock health progress tracks and labels.
   * @param {Array<Object>} [healthItems]
   */
  updateStockHealth(healthItems) {
    if (!Array.isArray(healthItems) || healthItems.length === 0) return;

    const rows = this.findElements('.stock-health > div');
    healthItems.forEach((item, index) => {
      const row = rows[index];
      if (!row) return;

      const labelStrong = row.querySelector('.stock-label strong');
      if (labelStrong && item.value !== undefined) {
        labelStrong.textContent = item.value;
        if (item.isWarning) {
          labelStrong.classList.add('warning-text');
        } else {
          labelStrong.classList.remove('warning-text');
        }
      }

      const progressSpan = row.querySelector('.progress-track span');
      if (progressSpan && item.percentage !== undefined) {
        progressSpan.style.width = `${item.percentage}%`;
      }
    });
  }

  /**
   * Render or update Stock Levels Bar Chart.
   * @param {Object} [levelsData]
   */
  renderStockLevelsChart(levelsData) {
    const labels = levelsData?.labels || ["Frontlit", "Glossy", "Star Flex", "Ink Cyan", "Foam Board"];
    const values = levelsData?.values || [180, 42, 110, 85, 65];
    const colors = levelsData?.colors || ["#10b981", "#ef4444", "#10b981", "#10b981", "#2563eb"];

    this.createChart("stockLevelsChart", {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Current Meters/Units",
          data: values,
          backgroundColor: colors,
          borderRadius: 5
        }]
      },
      options: {
        plugins: { legend: { display: false } }
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

