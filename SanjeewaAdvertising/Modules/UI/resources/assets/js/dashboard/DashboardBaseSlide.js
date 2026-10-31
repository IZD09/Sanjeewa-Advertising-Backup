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

  // Store data. Re-render charts if the slide is currently active.
  render(data = {}) {
    this.data = data;
    if (this.isActive) {
      this.renderCharts(this.data);
    }
  }

  onSlideEnter() {
    this.isActive = true;
    this.renderCharts(this.data);
  }

  onSlideLeave() {
    this.isActive = false;
    this.destroyCharts();
  }

  renderCharts(_data) {}

  createChart(canvas, config) {
    const target =
      typeof canvas === "string"
        ? this.findElement(`#${canvas}`) || document.getElementById(canvas)
        : canvas;

    if (!target || !window.Chart) return null;

    // Destroy an existing chart attached to this canvas.
    const existingChart = Chart.getChart(target);

    if (existingChart) {
      existingChart.destroy();
    }

    const chart = new Chart(target, config);

    this.charts.push(chart);

    return chart;
  }

  destroyCharts() {
    this.charts.forEach(chart => {
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
      }
    });

    this.charts = [];
  }

  refreshCharts() {
    this.destroyCharts();
    this.renderCharts(this.data);
  }

  resizeCharts() {
    this.charts.forEach(chart => {
      if (chart && typeof chart.resize === "function") {
        chart.resize();
      }
    });
  }

  destroy() {
    this.destroyCharts();
    this.isActive = false;
    this.data = {};
  }
}
