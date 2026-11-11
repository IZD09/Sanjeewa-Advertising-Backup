/**
 * SanjeewaAdvertising - Base Report Chart Handler
 *
 * Shared base controller for Chart.js instances and Single-Chart Selector toolbars
 * across all 6 report tabs.
 */

export class BaseReportChartHandler {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.tabGroup=""] - `data-tab-group` identifier for single-chart selector
   * @param {Object} [options.chartRegistry={}] - Shared chart registry map
   */
  constructor(options = {}) {
    this.tabGroup = options.tabGroup || "";
    this.charts = options.chartRegistry || {};
  }

  /**
   * Compute theme-aware Chart.js styling options (text color, grid lines, scales, legend).
   * @returns {{isDark: boolean, textColor: string, gridColor: string, commonScaleOptions: Object, commonLegend: Object}}
   */
  getThemeConfig() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textColor = isDark ? "#cbd5e1" : "#475569";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)";

    const commonScaleOptions = {
      x: {
        ticks: { color: textColor, font: { size: 11.5, weight: "600" } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          font: { size: 11.5 },
          callback: (val) => (val >= 1000 ? "Rs. " + (val / 1000).toFixed(0) + "k" : val)
        },
        grid: { color: gridColor }
      }
    };

    const commonLegend = {
      position: "bottom",
      labels: { color: textColor, boxWidth: 12, padding: 16, font: { size: 12, weight: "600" } }
    };

    // Dashboard-style smooth animations for Bar, Pie/Doughnut, and Line charts
    const barAnimation = {
      duration: 1000,
      easing: "easeOutQuart"
    };

    const pieAnimation = {
      animateRotate: true,
      animateScale: false,
      duration: 1000,
      easing: "easeOutQuart"
    };

    const lineAnimation = {
      duration: 1000,
      easing: "easeOutQuart"
    };

    return {
      isDark,
      textColor,
      gridColor,
      commonScaleOptions,
      commonLegend,
      barAnimation,
      pieAnimation,
      lineAnimation
    };
  }

  /**
   * Mount a Chart.js instance on a canvas element by ID.
   * @param {string} chartKey
   * @param {string} canvasId
   * @param {Object} config
   * @returns {Object|null}
   */
  mountChart(chartKey, canvasId, config) {
    if (typeof window.Chart === "undefined" || !config) return null;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (!this.chartConfigs) this.chartConfigs = {};
    this.chartConfigs[chartKey] = { canvasId, config };

    // Synchronize canvas internal width/height with container to eliminate initial 300x150 jump
    const wrap = ctx.parentElement;
    if (wrap && wrap.clientWidth > 0) {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight || 360;
      ctx.width = w;
      ctx.height = h;
      ctx.style.width = w + "px";
      ctx.style.height = h + "px";
    }

    if (this.charts[chartKey] && typeof this.charts[chartKey].destroy === "function") {
      this.charts[chartKey].destroy();
    }

    const instance = new window.Chart(ctx, config);
    this.charts[chartKey] = instance;
    return instance;
  }

  /**
   * Activate a single chart pane within this handler's tabGroup.
   * @param {string} targetPaneId
   */
  activateChartPane(targetPaneId) {
    if (!this.tabGroup || !targetPaneId) return;

    document.querySelectorAll(`.rep-chart-select-btn[data-tab-group="${this.tabGroup}"]`).forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-target-pane") === targetPaneId);
    });

    document.querySelectorAll(`.rep-chart-select-dropdown[data-tab-group="${this.tabGroup}"]`).forEach((select) => {
      if (select.value !== targetPaneId) {
        select.value = targetPaneId;
      }
    });

    document.querySelectorAll(`.rep-single-chart-pane[data-tab-group="${this.tabGroup}"]`).forEach((pane) => {
      pane.classList.toggle("active", pane.id === targetPaneId);
    });

    // Use double requestAnimationFrame to ensure browser has completed layout reflow
    // and canvas parent has full width before mounting/animating the chart
    const activePane = document.getElementById(targetPaneId);
    if (activePane) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const canvas = activePane.querySelector("canvas");
          if (canvas && window.Chart) {
            const chartInstance = window.Chart.getChart(canvas);
            const wrap = canvas.parentElement;
            if (wrap && wrap.clientWidth > 0) {
              const w = wrap.clientWidth;
              const h = wrap.clientHeight || 360;
              canvas.width = w;
              canvas.height = h;
              canvas.style.width = w + "px";
              canvas.style.height = h + "px";
            }

            if (chartInstance) {
              if (chartInstance.config.type === "doughnut" || chartInstance.config.type === "pie") {
                const config = chartInstance.config;
                const chartKey = Object.keys(this.charts).find((k) => this.charts[k] === chartInstance) || canvas.id;
                chartInstance.destroy();
                const freshChart = new window.Chart(canvas, config);
                this.charts[chartKey] = freshChart;
              } else {
                chartInstance.resize();
                chartInstance.reset();
                chartInstance.update();
              }
            }
          }
        });
      });
    }

    this.resizeCharts();
  }

  /**
   * Resize and update all managed Chart.js instances.
   */
  resizeCharts() {
    setTimeout(() => {
      Object.values(this.charts).forEach((chart) => {
        if (chart && typeof chart.resize === "function") {
          chart.resize();
          chart.update();
        }
      });
    }, 35);
  }
}

export default BaseReportChartHandler;
