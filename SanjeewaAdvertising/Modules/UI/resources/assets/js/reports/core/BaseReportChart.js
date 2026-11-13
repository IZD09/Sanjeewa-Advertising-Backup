/**
 * SanjeewaAdvertising - Base Report Chart Class
 *
 * Universal foundation class for individual Chart.js chart instances across reports.
 * Encapsulates theme detection, canvas sizing, animations, Chart.js configuration,
 * mounting, updating, reanimating, and destruction.
 */

export class BaseReportChart {
  /**
   * @param {Object} [options={}]
   * @param {string} options.canvasId - DOM ID of the canvas element
   * @param {string} options.chartKey - Unique key identifier in the registry
   * @param {string} [options.type="line"] - Default Chart.js type ('line', 'bar', 'doughnut', 'pie')
   * @param {string} [options.title=""] - Human-readable chart title
   * @param {Object} [options.chartRegistry={}] - Shared chart registry map
   */
  constructor(options = {}) {
    this.canvasId = options.canvasId || "";
    this.chartKey = options.chartKey || options.canvasId || "";
    this.type = options.type || "line";
    this.title = options.title || "";
    this.chartRegistry = options.chartRegistry || {};
    this.instance = null;
    this.currentData = null;
  }

  /**
   * Retrieve the canvas element.
   * @returns {HTMLCanvasElement|null}
   */
  getCanvas() {
    return typeof document !== "undefined" && this.canvasId
      ? document.getElementById(this.canvasId)
      : null;
  }

  /**
   * Compute theme-aware Chart.js styling options (text color, grid lines, scales, legend, animations).
   * @returns {Object}
   */
  getThemeConfig() {
    const isDark = typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark";
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

    const colors = {
      blue: "#1677ff",
      blueLight: "rgba(22, 119, 255, 0.12)",
      green: "#10b981",
      greenLight: "rgba(16, 185, 129, 0.15)",
      orange: "#f59e0b",
      orangeLight: "rgba(245, 158, 11, 0.15)",
      red: "#ef4444",
      redLight: "rgba(239, 68, 68, 0.15)",
      purple: "#8b5cf6",
      purpleLight: "rgba(139, 92, 246, 0.15)",
      cyan: "#06b6d4",
      slate: "#64748b"
    };

    return {
      isDark,
      textColor,
      gridColor,
      commonScaleOptions,
      commonLegend,
      barAnimation,
      pieAnimation,
      lineAnimation,
      colors
    };
  }

  /**
   * Build Chart.js configuration object.
   * Must be implemented by extending classes.
   *
   * @param {any} data
   * @returns {Object}
   */
  buildConfig(data) {
    throw new Error(`[BaseReportChart] buildConfig() must be implemented by subclass for chartKey: "${this.chartKey}".`);
  }

  /**
   * Render or mount the Chart.js instance on the target canvas.
   *
   * @param {any} data
   * @returns {Object|null}
   */
  render(data) {
    if (typeof window === "undefined" || typeof window.Chart === "undefined") {
      return null;
    }

    const ctx = this.getCanvas();
    if (!ctx) return null;

    this.currentData = data;
    const config = this.buildConfig(data);
    if (!config) return null;

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

    // Destroy existing instance if active
    this.destroy();

    // Verify canvas is completely released by Chart.js
    if (typeof window !== "undefined" && window.Chart && typeof window.Chart.getChart === "function") {
      try {
        const remaining = window.Chart.getChart(ctx) || (this.canvasId ? window.Chart.getChart(this.canvasId) : null);
        if (remaining && typeof remaining.destroy === "function") {
          remaining.destroy();
        }
      } catch (_) {}
    }

    const instance = new window.Chart(ctx, config);
    this.instance = instance;
    if (this.chartRegistry) {
      this.chartRegistry[this.chartKey] = instance;
    }

    return instance;
  }

  /**
   * Update the chart with fresh data.
   * @param {any} data
   */
  update(data) {
    if (data !== undefined) {
      this.currentData = data;
    }
    return this.render(this.currentData);
  }

  /**
   * Re-execute entrance animation smoothly matching dashboard behavior.
   * Recreates pie/doughnut charts cleanly to prevent zoom artifacts.
   */
  reanimate() {
    const ctx = this.getCanvas();
    if (!ctx || !window.Chart) return;

    const wrap = ctx.parentElement;
    if (wrap && wrap.clientWidth > 0) {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight || 360;
      ctx.width = w;
      ctx.height = h;
      ctx.style.width = w + "px";
      ctx.style.height = h + "px";
    }

    if (this.instance) {
      if (this.type === "doughnut" || this.type === "pie") {
        const config = this.instance.config;
        this.destroy();
        this.instance = new window.Chart(ctx, config);
        if (this.chartRegistry) {
          this.chartRegistry[this.chartKey] = this.instance;
        }
      } else {
        this.instance.resize();
        this.instance.reset();
        this.instance.update();
      }
    } else if (this.currentData) {
      this.render(this.currentData);
    }
  }

  /**
   * Destroy the active Chart.js instance and clean up registry references.
   */
  destroy() {
    if (this.instance && typeof this.instance.destroy === "function") {
      try {
        this.instance.destroy();
      } catch (_) {}
      this.instance = null;
    }

    const ctx = this.getCanvas();
    if (ctx && typeof window !== "undefined" && window.Chart && typeof window.Chart.getChart === "function") {
      try {
        const existing = window.Chart.getChart(ctx) || (this.canvasId ? window.Chart.getChart(this.canvasId) : null);
        if (existing && typeof existing.destroy === "function") {
          existing.destroy();
        }
      } catch (_) {}
    }

    if (this.chartRegistry && this.chartRegistry[this.chartKey]) {
      delete this.chartRegistry[this.chartKey];
    }
  }

  /**
   * Resize the chart canvas.
   */
  resize() {
    if (this.instance && typeof this.instance.resize === "function") {
      this.instance.resize();
      this.instance.update();
    }
  }
}

export default BaseReportChart;
