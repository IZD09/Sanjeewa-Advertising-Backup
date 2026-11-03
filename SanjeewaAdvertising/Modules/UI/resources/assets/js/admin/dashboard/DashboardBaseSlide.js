/**
 * DashboardBaseSlide
 * Base class for all dashboard slides in SanjeewaAdvertising.
 * Provides slide lifecycle management, chart creation/destruction, and element helpers.
 */

export class DashboardBaseSlide {
  /**
   * @param {HTMLElement} element - The root slide DOM element.
   * @param {HTMLElement} [root] - The root document element for CSS variables.
   */
  constructor(element, root) {
    this.element = element;
    this.root = root || document.documentElement;
    this.data = {};
    this.charts = [];
    this.isActive = false;
    this.isInitialRender = true;
    this.hasRenderedData = false;
    this.hasPendingUpdate = false;
  }

  getColors() {
    return {
      orange: "#f47b35",
      blue: "#4388f5",
      green: "#10a778",
      red: "#e45b61",
      purple: "#8b5cf6",
      cyan: "#17a9b8"
    };
  }

  getMutedColor() {
    return (
      getComputedStyle(this.root)
        .getPropertyValue("--muted-color")
        .trim() || "#71809b"
    );
  }

  getGridColor() {
    return (
      getComputedStyle(this.root)
        .getPropertyValue("--grid-color")
        .trim() || "#e7edf5"
    );
  }

  findElement(selector) {
    return this.element ? this.element.querySelector(selector) : null;
  }

  findElements(selector) {
    return this.element ? [...this.element.querySelectorAll(selector)] : [];
  }

  setText(id, text) {
    const el = document.getElementById(id);

    if (el) {
      el.textContent = text ?? "";
    }
  }

  /**
   * Set and stage incoming data payload from DataService/SSE.
   * If initial render or no data rendered yet, renders content and active charts immediately.
   * If currently active with existing data, defers re-rendering until slide transition.
   * @param {Object} [data]
   */
  setData(data = {}) {
    this.data = data;
    const hasData = Boolean(data && typeof data === "object" && Object.keys(data).length > 0);

    if (!this.hasRenderedData && hasData) {
      this.hasRenderedData = true;
      this.isInitialRender = false;
      this.hasPendingUpdate = false;
      this.renderContent(this.data);
      if (this.isActive) {
        this.renderCharts(this.data);
      }
      return;
    }

    if (this.isInitialRender) {
      this.isInitialRender = false;
      if (hasData) {
        this.hasRenderedData = true;
      }
      this.renderContent(this.data);
      if (this.isActive) {
        this.renderCharts(this.data);
      }
      return;
    }

    // Defer re-rendering so active slide is not abruptly re-rendered while user is viewing
    this.hasPendingUpdate = true;
  }

  /**
   * Backward-compatible render method.
   * @param {Object} [data]
   */
  render(data = {}) {
    this.setData(data);
  }

  /**
   * Hook for slide subclasses to render HTML/DOM content (metrics, badges, lists).
   * @param {Object} [_data]
   */
  renderContent(_data = {}) {}

  /**
   * Hook for slide subclasses to render Chart.js charts.
   * @param {Object} [_data]
   */
  renderCharts(_data = {}) {}

  onSlideEnter() {
    this.isActive = true;
    const hasData = Boolean(this.data && typeof this.data === "object" && Object.keys(this.data).length > 0);

    if (this.hasPendingUpdate || !this.hasRenderedData || this.isInitialRender) {
      this.isInitialRender = false;
      this.hasPendingUpdate = false;
      if (hasData) {
        this.hasRenderedData = true;
      }
      this.renderContent(this.data);
    }
    this.renderCharts(this.data);
  }

  onSlideLeave() {
    this.isActive = false;
    this.destroyCharts();
  }

  createChart(canvas, config) {
    const target =
      typeof canvas === "string"
        ? this.findElement(`#${canvas}`) || document.getElementById(canvas)
        : canvas;

    if (!target || !target.isConnected || !window.Chart) return null;

    // Destroy an existing chart attached to this canvas and purge from this.charts
    const existingChart = Chart.getChart(target);

    if (existingChart) {
      this.charts = this.charts.filter(c => c !== existingChart);
      try {
        existingChart.destroy();
      } catch (e) {}
    }

    // Purge any destroyed, detached, or duplicate charts targeting this canvas
    this.charts = this.charts.filter(c => {
      return Boolean(c && c.canvas && c.canvas !== target && c.canvas.isConnected && typeof c.resize === "function");
    });

    try {
      const chart = new Chart(target, config);
      this.charts.push(chart);
      return chart;
    } catch (err) {
      console.warn("[DashboardBaseSlide] Error creating chart:", err);
      return null;
    }
  }

  destroyCharts() {
    this.charts.forEach(chart => {
      if (chart && typeof chart.destroy === "function") {
        try {
          chart.destroy();
        } catch (e) {}
      }
    });

    this.charts = [];
  }

  refreshCharts() {
    this.destroyCharts();
    if (this.isActive) {
      this.renderCharts(this.data);
    }
  }

  resizeCharts() {
    if (!this.isActive) return;

    // Filter out destroyed charts or charts without a connected canvas
    this.charts = this.charts.filter(chart => {
      return Boolean(chart && chart.canvas && chart.canvas.isConnected && typeof chart.resize === "function");
    });

    this.charts.forEach(chart => {
      try {
        chart.resize();
      } catch (err) {
        // Silently ignore resize error if canvas was detached during animation
      }
    });
  }

  destroy() {
    this.destroyCharts();
    this.isActive = false;
    this.data = {};
  }
}
