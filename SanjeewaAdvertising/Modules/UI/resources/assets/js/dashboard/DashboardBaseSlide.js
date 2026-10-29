/**
 * DashboardBaseSlide
 * Abstract base class for all dashboard slides in SanjeewaAdvertising.
 * Provides shared slide lifecycle management, chart creation/destruction,
 * theme color resolution, and 2D canvas fallback rendering.
 */

export class DashboardBaseSlide {
  /**
   * @param {HTMLElement} element - The root slide DOM element.
   * @param {Object} [options={}] - Optional configuration.
   */
  constructor(element, options = {}) {
    if (!element) {
      throw new Error(`[DashboardBaseSlide] Slide element is required.`);
    }

    this.element = element;
    this.options = options;
    this.charts = {};
    this.isActive = false;
    this.lastData = null;
  }

  /**
   * Query a descendant element within this slide.
   * @param {string} selector
   * @returns {HTMLElement|null}
   */
  findElement(selector) {
    return this.element ? this.element.querySelector(selector) : null;
  }

  /**
   * Query all descendant elements within this slide.
   * @param {string} selector
   * @returns {HTMLElement[]}
   */
  findElements(selector) {
    return this.element ? [...this.element.querySelectorAll(selector)] : [];
  }

  /**
   * Lifecycle method: Called when new data arrives or slide is first rendered.
   * Subclasses must implement their specific rendering logic and chart setup.
   * @param {Object} data
   */
  render(data) {
    this.lastData = data;
  }

  /**
   * Lifecycle method: Called when this slide becomes active/visible.
   */
  onSlideEnter() {
    this.isActive = true;
    if (this.lastData) {
      this.render(this.lastData);
    } else {
      this.refreshCharts();
    }
  }

  /**
   * Lifecycle method: Called when leaving this slide.
   */
  onSlideLeave() {
    this.isActive = false;
  }

  /**
   * Re-render visible charts for this slide.
   */
  refreshCharts() {
    if (this.lastData) {
      this.render(this.lastData);
    }
  }

  /**
   * Handle responsive resizing for charts on this slide.
   */
  resizeCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.resize === "function") {
        chart.resize();
      }
    });

    if (this.isActive) {
      this.refreshCharts();
    }
  }

  /**
   * Clean up all charts and resources associated with this slide.
   */
  destroy() {
    this.destroyAllCharts();
    this.isActive = false;
    this.lastData = null;
  }

  /**
   * Safely destroy a specific chart by canvas ID.
   * @param {string} targetId
   */
  destroyChart(targetId) {
    if (this.charts[targetId]) {
      try {
        this.charts[targetId].destroy();
      } catch (e) {
        console.warn(`[DashboardBaseSlide] Error destroying chart ${targetId}:`, e);
      }
      delete this.charts[targetId];
    }
  }

  /**
   * Destroy all active chart instances on this slide.
   */
  destroyAllCharts() {
    Object.keys(this.charts).forEach(id => this.destroyChart(id));
  }

  /**
   * Resolve theme colors according to current HTML data-theme attribute.
   * @returns {Object}
   */
  getChartColors() {
    const isDark = document.documentElement.dataset.theme === "dark";

    return {
      text: isDark ? "#94a3b8" : "#64748b",
      grid: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)",
      blue: "#2563eb",
      red: "#ef4444",
      green: "#10b981",
      orange: "#f59e0b",
      purple: "#8b5cf6",
      sky: "#0ea5e9"
    };
  }

  /**
   * Create or update a Chart.js instance with automatic fallback to native Canvas.
   * @param {string} canvasId
   * @param {Object} config
   */
  createChart(canvasId, config) {
    const canvas = this.findElement(`#${canvasId}`) || document.getElementById(canvasId);
    if (!canvas) return;

    this.destroyChart(canvasId);

    if (typeof Chart === "undefined") {
      this.drawFallbackChart(canvas, config);
      return;
    }

    const colors = this.getChartColors();

    config.options = config.options || {};
    config.options.responsive = true;
    config.options.maintainAspectRatio = false;
    config.options.animation = { duration: 350 };
    config.options.plugins = config.options.plugins || {};
    config.options.plugins.legend = config.options.plugins.legend || {};

    if (config.type === "doughnut") {
      config.options.plugins.legend.position = window.innerWidth > 680 ? "right" : "bottom";
      config.options.plugins.legend.labels = {
        color: colors.text,
        usePointStyle: true,
        boxWidth: 8,
        padding: window.innerWidth > 680 ? 12 : 8,
        font: { family: "Inter", size: 10 }
      };
    } else {
      config.options.plugins.legend.labels = {
        color: colors.text,
        usePointStyle: true,
        boxWidth: 8,
        padding: 12,
        font: { family: "Inter", size: 10 }
      };

      config.options.scales = config.options.scales || {};
      ["x", "y"].forEach(axis => {
        config.options.scales[axis] = config.options.scales[axis] || {};
        config.options.scales[axis].grid = {
          color: colors.grid,
          drawBorder: false
        };
        config.options.scales[axis].ticks = {
          color: colors.text,
          font: { family: "Inter", size: 9.5 }
        };
        config.options.scales[axis].border = { display: false };
      });

      if (config.options.scales.y) {
        config.options.scales.y.beginAtZero = true;
      }
    }

    try {
      this.charts[canvasId] = new Chart(canvas, config);
    } catch (err) {
      console.warn(`[DashboardBaseSlide] Chart.js failed for ${canvasId}, using fallback:`, err);
      this.drawFallbackChart(canvas, config);
    }
  }

  /**
   * Native HTML5 Canvas 2D fallback renderer when Chart.js is unavailable.
   * Supports doughnut, line, and bar charts.
   * @param {HTMLCanvasElement} canvas
   * @param {Object} config
   */
  drawFallbackChart(canvas, config) {
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const w = rect.width > 20 ? rect.width : 340;
    const h = rect.height > 20 ? rect.height : 220;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const colors = this.getChartColors();
    const isDark = document.documentElement.dataset.theme === "dark";

    if (config.type === "doughnut") {
      const data = config.data?.datasets?.[0]?.data || [10, 20, 30];
      const bgColors = config.data?.datasets?.[0]?.backgroundColor || ["#2563eb", "#ef4444", "#10b981", "#f59e0b"];
      const total = data.reduce((a, b) => a + b, 0) || 1;

      const centerX = config.options?.plugins?.legend?.display === false ? w / 2 : (w > 320 ? w * 0.4 : w / 2);
      const centerY = h / 2;
      const radius = Math.min(centerX - 15, centerY - 15, 75);
      const innerRadius = radius * 0.65;

      let startAngle = -Math.PI / 2;
      data.forEach((val, i) => {
        const sliceAngle = (val / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = bgColors[i % bgColors.length] || "#2563eb";
        ctx.fill();
        startAngle += sliceAngle;
      });

      // Central cutout fill
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius - 0.5, 0, 2 * Math.PI);
      ctx.fillStyle = isDark ? "#111a2e" : "#ffffff";
      ctx.fill();

      // Side legend if width permits
      if (config.options?.plugins?.legend?.display !== false && w > 280) {
        const labels = config.data?.labels || [];
        const legX = w > 320 ? w * 0.72 : w * 0.65;
        let legY = Math.max(16, centerY - (labels.length * 10));

        ctx.font = "600 10px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        labels.forEach((lbl, i) => {
          ctx.fillStyle = bgColors[i % bgColors.length] || "#2563eb";
          ctx.fillRect(legX, legY - 4, 8, 8);
          ctx.fillStyle = colors.text;
          ctx.fillText(lbl, legX + 13, legY);
          legY += 18;
        });
      }
    } else if (config.type === "line") {
      const padding = { top: 20, right: 20, bottom: 28, left: 45 };
      const plotW = w - padding.left - padding.right;
      const plotH = h - padding.top - padding.bottom;

      const datasets = config.data?.datasets || [];
      const labels = config.data?.labels || [];

      let maxVal = 0;
      datasets.forEach(ds => {
        const dsMax = Math.max(...(ds.data || [0]));
        if (dsMax > maxVal) maxVal = dsMax;
      });
      maxVal = maxVal > 0 ? maxVal * 1.15 : 100;

      // Draw horizontal grid lines
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      ctx.fillStyle = colors.text;
      ctx.font = "9.5px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      const gridLines = 4;
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (plotH / gridLines) * i;
        const val = Math.round(maxVal - (maxVal / gridLines) * i);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
        ctx.fillText(val, padding.left - 6, y);
      }

      // Draw X axis labels
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const stepX = labels.length > 1 ? plotW / (labels.length - 1) : plotW;
      labels.forEach((lbl, i) => {
        const x = padding.left + i * stepX;
        ctx.fillText(lbl, x, h - padding.bottom + 6);
      });

      // Draw datasets
      datasets.forEach((ds) => {
        const pts = (ds.data || []).map((val, i) => ({
          x: padding.left + i * stepX,
          y: padding.top + plotH - (val / maxVal) * plotH
        }));

        if (!pts.length) return;

        // Fill area
        if (ds.fill) {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, padding.top + plotH);
          pts.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.lineTo(pts[pts.length - 1].x, padding.top + plotH);
          ctx.closePath();
          ctx.fillStyle = ds.backgroundColor || "rgba(37, 99, 235, 0.12)";
          ctx.fill();
        }

        // Draw line
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.strokeStyle = ds.borderColor || "#2563eb";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw points
        pts.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, 2 * Math.PI);
          ctx.fillStyle = ds.borderColor || "#2563eb";
          ctx.fill();
        });
      });
    } else if (config.type === "bar") {
      const padding = { top: 20, right: 20, bottom: 32, left: 45 };
      const plotW = w - padding.left - padding.right;
      const plotH = h - padding.top - padding.bottom;

      const datasets = config.data?.datasets || [];
      const labels = config.data?.labels || [];

      let maxVal = 0;
      datasets.forEach(ds => {
        const dsMax = Math.max(...(ds.data || [0]));
        if (dsMax > maxVal) maxVal = dsMax;
      });
      maxVal = maxVal > 0 ? maxVal * 1.15 : 100;

      // Draw horizontal grid lines
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      ctx.fillStyle = colors.text;
      ctx.font = "9.5px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      const gridLines = 4;
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (plotH / gridLines) * i;
        const val = Math.round(maxVal - (maxVal / gridLines) * i);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
        ctx.fillText(val, padding.left - 6, y);
      }

      // Draw bars
      const numGroups = labels.length || 1;
      const groupWidth = plotW / numGroups;
      const numDs = datasets.length || 1;
      const barWidth = Math.max(4, Math.min(22, (groupWidth * 0.7) / numDs));

      labels.forEach((lbl, groupIdx) => {
        const groupCenterX = padding.left + groupIdx * groupWidth + groupWidth / 2;

        datasets.forEach((ds, dsIdx) => {
          const val = ds.data?.[groupIdx] || 0;
          const barH = (val / maxVal) * plotH;
          const offsetX = (dsIdx - (numDs - 1) / 2) * (barWidth + 2);
          const barX = groupCenterX + offsetX - barWidth / 2;
          const barY = padding.top + plotH - barH;

          ctx.fillStyle = Array.isArray(ds.backgroundColor)
            ? (ds.backgroundColor[groupIdx] || "#2563eb")
            : (ds.backgroundColor || "#2563eb");

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(barX, barY, barWidth, Math.max(2, barH), [3, 3, 0, 0]);
          } else {
            ctx.rect(barX, barY, barWidth, Math.max(2, barH));
          }
          ctx.fill();
        });

        // X label
        ctx.fillStyle = colors.text;
        ctx.font = "9px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(lbl.length > 9 ? lbl.substring(0, 8) + '…' : lbl, groupCenterX, h - padding.bottom + 6);
      });
    }
  }
}

