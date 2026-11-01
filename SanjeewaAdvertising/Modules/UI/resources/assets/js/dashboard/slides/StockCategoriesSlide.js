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
   * Render slide metrics in the DOM.
   * @param {Object} [data]
   */
  renderContent(data = {}) {
    const stockData = data?.stock || this.data?.stock || {};
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

    const container = this.findElement('.stock-health');
    if (!container) return;

    const rows = this.findElements('.stock-health > div');
    if (rows.length !== healthItems.length) {
      container.innerHTML = healthItems.map(item => `
        <div>
          <div class="stock-label">
            <span>${item.name || ''}</span>
            <strong style="color: ${item.color || '#2563eb'};">${item.value || ''}</strong>
          </div>
          <div class="progress-track">
            <span style="width: ${item.percentage || 0}%; background-color: ${item.color || '#2563eb'};"></span>
          </div>
        </div>
      `).join('');
      return;
    }

    healthItems.forEach((item, index) => {
      const row = rows[index];
      if (!row) return;

      const nameSpan = row.querySelector('.stock-label span:first-child');
      if (nameSpan && item.name) {
        nameSpan.textContent = item.name;
      }

      const labelStrong = row.querySelector('.stock-label strong');
      if (labelStrong && item.value !== undefined) {
        labelStrong.textContent = item.value;
        if (item.color) {
          labelStrong.style.color = item.color;
        }
      }

      const progressSpan = row.querySelector('.progress-track span');
      if (progressSpan) {
        if (item.percentage !== undefined) {
          progressSpan.style.width = `${item.percentage}%`;
        }
        if (item.color) {
          progressSpan.style.backgroundColor = item.color;
        }
      }
    });
  }

  /**
   * Render or update Stock Levels Bar Chart (Horizontal for low-stock items).
   * @param {Object} [levelsData]
   */
  renderStockLevelsChart(levelsData) {
    const labels = levelsData?.labels || [];
    const values = levelsData?.values || [];
    const defaultColors = [
      "#ef4444",
      "#f59e0b",
      "#8b5cf6",
      "#0ea5e9",
      "#2563eb"
    ];
    const colors = levelsData?.colors && levelsData.colors.length > 0 ? levelsData.colors : defaultColors;

    this.createChart("stockLevelsChart", {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Remaining Stock (Low)",
          data: values,
          backgroundColor: colors,
          borderRadius: 4,
          barThickness: 16,
          maxBarThickness: 20
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true
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

