"use strict";

class SanjeewaAdvertisingDashboard {
  constructor() {
    this.slides = [...document.querySelectorAll(".dashboard-slide")];
    this.navLinks = [...document.querySelectorAll(".nav-link")];
    this.dots = [...document.querySelectorAll(".slide-dot")];

    this.currentSlide = 0;
    this.slideInterval = null;
    this.uiHideTimeout = null;
    this.topbarHideTimeout = null;
    this.isTopbarHovered = false;
    this.isTopbarFocused = false;
    this.topbar = document.getElementById("topbar");
    this.topbarHoverZone = document.getElementById("topbarHoverZone");
    this.slideDuration = 7000;
    this.uiHideDelay = 3500;
    this.isPaused = false;
    this.isMobileMenuOpen = false;
    this.isSidebarCollapsed = localStorage.getItem("sa-sidebar-collapsed") === "true";
    this.charts = {};

    this.init();
  }

  init() {
    this.initEvents();
    this.initTopbarAutoHide();
    this.initResizeObserver();
    this.showSlide(0);
    this.startSlideshow();
    this.resetUIHideTimer();

    // Check if Chart.js finishes loading asynchronously
    let attempts = 0;
    const chartChecker = setInterval(() => {
      attempts++;
      if (typeof Chart !== "undefined") {
        clearInterval(chartChecker);
        this.refreshVisibleCharts();
      } else if (attempts > 30) {
        clearInterval(chartChecker);
      }
    }, 150);

    window.addEventListener("load", () => {
      setTimeout(() => this.refreshVisibleCharts(), 50);
    });
  }

  initResizeObserver() {
    if (window.ResizeObserver) {
      let rAF;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(() => {
          this.resizeVisibleCharts();
        });
      });
      const mainArea = document.querySelector(".main-area");
      if (mainArea) observer.observe(mainArea);
    }
  }

  initEvents() {
    const prevBtn = document.getElementById("previousSlide");
    if (prevBtn) prevBtn.addEventListener("click", () => this.previousSlide());

    const nextBtn = document.getElementById("nextSlide");
    if (nextBtn) nextBtn.addEventListener("click", () => this.nextSlide());

    const pauseBtn = document.getElementById("pauseSlides");
    if (pauseBtn) pauseBtn.addEventListener("click", () => this.togglePause());

    this.dots.forEach(dot => {
      dot.addEventListener("click", () => {
        this.showSlide(Number(dot.dataset.index));
        this.restartSlideshow();
      });
    });

    document.querySelectorAll("[data-slide]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        this.showSlide(Number(link.dataset.slide));
        this.restartSlideshow();
        this.showUI();
      });
    });

    document.addEventListener("mousemove", () => {
      if (!window.appRouter || window.appRouter.currentRoute === "dashboard") {
        this.resetUIHideTimer();
      }
    });

    document.addEventListener("mousedown", () => {
      if (!window.appRouter || window.appRouter.currentRoute === "dashboard") {
        this.resetUIHideTimer();
      }
    });

    document.addEventListener("keydown", event => {
      if (window.appRouter && window.appRouter.currentRoute !== "dashboard") return;

      this.resetUIHideTimer();

      if (event.key === "ArrowRight") {
        this.nextSlide();
        this.restartSlideshow();
      } else if (event.key === "ArrowLeft") {
        this.previousSlide();
        this.restartSlideshow();
      }
    });

    document.addEventListener("touchstart", () => {
      if (!window.appRouter || window.appRouter.currentRoute === "dashboard") {
        this.resetUIHideTimer();
      }
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stopSlideshow();
      } else if (!this.isPaused && (!window.appRouter || window.appRouter.currentRoute === "dashboard")) {
        this.startSlideshow();
      }
    });

    window.addEventListener("resize", () => {
      this.resizeVisibleCharts();
    });
  }

  showSlide(index) {
    if (!this.slides.length) return;

    this.currentSlide = (index + this.slides.length) % this.slides.length;

    this.slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === this.currentSlide);
    });

    this.dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === this.currentSlide);
    });

    const activeSlide = this.slides[this.currentSlide];
    const title = activeSlide.dataset.title || "Dashboard";
    const navTitle = activeSlide.dataset.nav || title;

    const counterElem = document.getElementById("slideCounter");
    if (counterElem) {
      counterElem.textContent = `${String(this.currentSlide + 1).padStart(2, "0")} / ${String(this.slides.length).padStart(2, "0")}`;
    }

    if (!window.appRouter || window.appRouter.currentRoute === "dashboard") {
      const pageTitle = document.getElementById("pageTitle");
      const breadcrumbTitle = document.getElementById("breadcrumbTitle");
      if (pageTitle) pageTitle.textContent = title;
      if (breadcrumbTitle) breadcrumbTitle.textContent = navTitle;

      this.navLinks.forEach(link => {
        if (!link.hasAttribute("data-slide")) return;
        link.classList.toggle(
          "active",
          Number(link.dataset.slide) === this.currentSlide
        );
      });
    }

    this.renderSlideCharts(this.currentSlide);
  }

  nextSlide() {
    this.showSlide(this.currentSlide + 1);
  }

  previousSlide() {
    this.showSlide(this.currentSlide - 1);
  }

  startSlideshow() {
    this.stopSlideshow();

    if (this.isPaused || document.hidden) return;

    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.slideDuration);
  }

  stopSlideshow() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  restartSlideshow() {
    this.startSlideshow();
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    const button = document.getElementById("pauseSlides");
    button.innerHTML = this.isPaused
      ? '<i class="fa-solid fa-play"></i>'
      : '<i class="fa-solid fa-pause"></i>';

    button.setAttribute(
      "aria-label",
      this.isPaused ? "Resume slideshow" : "Pause slideshow"
    );

    if (this.isPaused) this.stopSlideshow();
    else this.startSlideshow();

    this.showUI();
  }

  resetUIHideTimer() {
    document.body.classList.remove("ui-hidden");
    clearTimeout(this.uiHideTimeout);

    this.uiHideTimeout = setTimeout(() => {
      if (!this.isMobileMenuOpen) {
        document.body.classList.add("ui-hidden");
      }
    }, this.uiHideDelay);
  }

  showUI() {
    document.body.classList.remove("ui-hidden");
    this.resetUIHideTimer();
    if (window.topbarController) {
      window.topbarController.showTopbar();
    }
  }

  initTopbarAutoHide() {
    // Delegated to global window.topbarController (handles all modules unified)
    if (window.topbarController) {
      window.topbarController.showTopbar();
    }
  }

  showTopbar() {
    if (window.topbarController) {
      window.topbarController.showTopbar();
    } else if (this.topbar) {
      this.topbar.classList.remove("topbar-hidden");
      this.topbar.classList.add("topbar-visible");
    }
  }

  hideTopbar() {
    if (window.topbarController) {
      window.topbarController.hideTopbar();
    } else if (this.topbar) {
      this.topbar.classList.remove("topbar-visible");
      this.topbar.classList.add("topbar-hidden");
    }
  }

  scheduleTopbarHide(delay = 1200) {
    // No-op: Global topbarController manages hover-based reveal and hide cleanly without timers
  }

  toggleDesktopSidebar() {
    if (window.sidebarComponent) {
      window.sidebarComponent.toggleDesktopSidebar();
    }
  }

  updateSidebarToggleButton() {
    if (window.sidebarComponent) {
      window.sidebarComponent.updateToggleIcon();
    }
  }

  openMobileMenu() {
    if (window.sidebarComponent) {
      window.sidebarComponent.openMobileDrawer();
    }
  }

  closeMobileMenu() {
    if (window.sidebarComponent) {
      window.sidebarComponent.closeMobileDrawer();
    }
  }

  getChartColors() {
    const dark = document.documentElement.dataset.theme === "dark";

    return {
      text: dark ? "#94a3b8" : "#64748b",
      grid: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)",
      blue: "#2563eb",
      red: "#ef4444",
      green: "#10b981",
      orange: "#f59e0b"
    };
  }

  createChart(id, config) {
    const aliasMap = {
      salesChart: "revenueTrendChart",
      revenueChart: "salesCategoryChart",
      serviceChart: "paymentMethodsChart",
      productionChart: "weeklyOutputChart",
      jobTypeChart: "materialUsageChart",
      stockChart: "stockLevelsChart",
      financeChart: "financeComparisonChart"
    };

    const targetId = aliasMap[id] || id;
    const canvas = document.getElementById(targetId) || document.getElementById(id);
    if (!canvas) return;

    if (this.charts[targetId]) {
      try {
        this.charts[targetId].destroy();
      } catch (e) {}
      delete this.charts[targetId];
    }

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
      this.charts[targetId] = new Chart(canvas, config);
    } catch (err) {
      console.warn("Chart.js failed to initialize, drawing fallback canvas chart", err);
      this.drawFallbackChart(canvas, config);
    }
  }

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
          ctx.roundRect(barX, barY, barWidth, Math.max(2, barH), [3, 3, 0, 0]);
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

  renderSlideCharts(index) {
    switch (index) {
      case 0:
        // 1. Monthly Revenue Line Chart
        this.createChart("revenueTrendChart", {
          type: "line",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
            datasets: [{
              label: "Revenue (Rs. thousands)",
              data: [420, 510, 480, 650, 590, 720, 680, 790, 740, 845],
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.12)",
              fill: true,
              tension: 0.38,
              pointRadius: 3.5,
              pointBackgroundColor: "#2563eb"
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
          }
        });

        // 2. Active Orders Doughnut Chart
        this.createChart("ordersDoughnutChart", {
          type: "doughnut",
          data: {
            labels: ["Completed", "Printing", "Designing", "Pending"],
            datasets: [{
              data: [14, 8, 6, 4],
              backgroundColor: ["#10b981", "#2563eb", "#8b5cf6", "#f59e0b"],
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: {
            cutout: "68%",
            plugins: { legend: { display: false } }
          }
        });
        break;

      case 1:
        // 3. Sales Category Bar Chart
        this.createChart("salesCategoryChart", {
          type: "bar",
          data: {
            labels: ["Flex", "Vinyl", "Rollup", "Cards", "Leaflets", "Rigid"],
            datasets: [
              {
                label: "2026",
                data: [340, 260, 180, 120, 95, 65],
                backgroundColor: "#2563eb",
                borderRadius: 5
              },
              {
                label: "2025",
                data: [280, 210, 140, 90, 70, 50],
                backgroundColor: "rgba(249, 115, 22, 0.75)",
                borderRadius: 5
              }
            ]
          }
        });

        // 4. Payment Collections Breakdown
        this.createChart("paymentMethodsChart", {
          type: "doughnut",
          data: {
            labels: ["Cash", "Card", "Bank Transfer", "Online / QR", "Cheque"],
            datasets: [{
              data: [38, 26, 20, 11, 5],
              backgroundColor: ["#10b981", "#2563eb", "#8b5cf6", "#f59e0b", "#64748b"],
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: {
            cutout: "66%"
          }
        });
        break;

      case 2:
        // 5. Weekly Output Bar Chart
        this.createChart("weeklyOutputChart", {
          type: "bar",
          data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
              label: "Square Feet",
              data: [1240, 1680, 1450, 2100, 2480, 1950, 850],
              backgroundColor: "#ef4444",
              borderRadius: 5
            }]
          },
          options: {
            plugins: { legend: { display: false } }
          }
        });

        // 6. Material Usage Distribution
        this.createChart("materialUsageChart", {
          type: "doughnut",
          data: {
            labels: ["Frontlit", "Star Flex", "Glossy", "Matte", "Backlit"],
            datasets: [{
              data: [42, 24, 18, 10, 6],
              backgroundColor: ["#2563eb", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6"],
              borderWidth: 0
            }]
          },
          options: {
            cutout: "65%"
          }
        });
        break;

      case 3:
        // 7. Stock Levels Bar Chart
        this.createChart("stockLevelsChart", {
          type: "bar",
          data: {
            labels: ["Frontlit", "Glossy", "Star Flex", "Ink Cyan", "Foam Board"],
            datasets: [
              {
                label: "Current Meters/Units",
                data: [180, 42, 110, 85, 65],
                backgroundColor: ["#10b981", "#ef4444", "#10b981", "#10b981", "#2563eb"],
                borderRadius: 5
              }
            ]
          },
          options: {
            plugins: { legend: { display: false } }
          }
        });
        break;

      case 4:
        // 8. Finance Comparison Chart
        this.createChart("financeComparisonChart", {
          type: "line",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
            datasets: [
              {
                label: "Revenue",
                data: [580, 620, 700, 650, 790, 740, 810, 780, 820, 845],
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.10)",
                fill: true,
                tension: 0.35,
                pointRadius: 3
              },
              {
                label: "Expenses",
                data: [320, 360, 390, 370, 420, 410, 450, 430, 460, 468],
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                fill: true,
                tension: 0.35,
                pointRadius: 3
              }
            ]
          }
        });
        break;
    }
  }

  refreshVisibleCharts() {
    this.renderSlideCharts(this.currentSlide);
  }

  resizeVisibleCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.resize === "function") {
        chart.resize();
      }
    });
    this.renderSlideCharts(this.currentSlide);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.dashboardInstance = window.sanjeewaDashboard = new SanjeewaAdvertisingDashboard();
});