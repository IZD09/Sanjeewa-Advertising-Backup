/**
 * SanjeewaAdvertising Admin Dashboard Entry Point
 * Orchestrates:
 * DashboardDataService -> admin/dashboard.js -> SlideController / Slide Instances
 */

import { DashboardDataService } from './dashboard/DashboardDataService.js';
import { SlideController } from './dashboard/SlideController.js';
import { DashboardOverviewSlide } from './dashboard/slides/DashboardOverviewSlide.js';
import { RevenueComparisonSlide } from './dashboard/slides/RevenueComparisonSlide.js';
import { JobStatusSlide } from './dashboard/slides/JobStatusSlide.js';
import { StockCategoriesSlide } from './dashboard/slides/StockCategoriesSlide.js';
import { FinancialPerformanceSlide } from './dashboard/slides/FinancialPerformanceSlide.js';

export class AdminDashboard {
  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.options = options;
    this.rootElement = document.getElementById("module-dashboard") || document.querySelector(".dashboard-content");

    this.dataService = null;
    this.controller = null;
    this.slides = [];

    this.init();
  }

  /**
   * Initialize data service, slide instances, slide controller, and event flow.
   */
  init() {
    if (!this.rootElement) {
      return;
    }

    const slideElements = [...this.rootElement.querySelectorAll(".dashboard-slide")];
    if (!slideElements.length) {
      return;
    }

    // 1. Initialize Dashboard Data Service
    const apiUrl = this.rootElement.dataset.apiUrl || '/dashboard/data';
    const sseUrl = this.rootElement.dataset.sseUrl || '/dashboard/stream';
    let initialData = null;
    const scriptPayload = document.getElementById("dashboard-initial-data");
    if (scriptPayload && scriptPayload.textContent) {
      try {
        initialData = JSON.parse(scriptPayload.textContent);
      } catch (e) {
        initialData = null;
      }
    }
    if (!initialData && this.rootElement.dataset.initialPayload) {
      try {
        initialData = JSON.parse(this.rootElement.dataset.initialPayload);
      } catch (e) {
        initialData = null;
      }
    }
    this.dataService = new DashboardDataService({ apiUrl, sseUrl, initialData });

    // 2. Instantiate Slide Classes
    const overviewEl = slideElements[0] || this.rootElement.querySelector('[data-nav="Dashboard"]');
    const revenueEl = slideElements[1] || this.rootElement.querySelector('[data-nav="Sales & Revenue"]');
    const jobsEl = slideElements[2] || this.rootElement.querySelector('[data-nav="Print Jobs"]');
    const stockEl = slideElements[3] || this.rootElement.querySelector('[data-nav="Stock Management"]');
    const financeEl = slideElements[4] || this.rootElement.querySelector('[data-nav="Financial Summary"]');

    const overviewSlide = new DashboardOverviewSlide(overviewEl);
    const revenueSlide = new RevenueComparisonSlide(revenueEl);
    const jobStatusSlide = new JobStatusSlide(jobsEl);
    const stockSlide = new StockCategoriesSlide(stockEl);
    const financeSlide = new FinancialPerformanceSlide(financeEl);

    this.slides = [
      overviewSlide,
      revenueSlide,
      jobStatusSlide,
      stockSlide,
      financeSlide
    ];

    // 3. Connect Data Flow: DataService -> Slide Instances
    this.dataService.onData(data => {
      this.slides.forEach(slide => {
        try {
          if (typeof slide.setData === "function") {
            slide.setData(data);
          } else {
            slide.render(data);
          }
        } catch (err) {
          console.error(`[AdminDashboard] Error updating slide ${slide.name}:`, err);
        }
      });
    });

    // 4. Determine initial slide index from query param (e.g. ?slide=1 for Sales & Revenue)
    let initialSlideIndex = 0;
    const urlParams = new URLSearchParams(window.location.search);
    const slideParam = urlParams.get('slide');
    if (slideParam !== null && slideParam !== '' && !isNaN(slideParam)) {
      const targetIndex = parseInt(slideParam, 10);
      if (targetIndex >= 0 && targetIndex < this.slides.length) {
        initialSlideIndex = targetIndex;
      }
    }

    // 5. Initialize Data Service FIRST so initial payload populates slides before active slide renders charts once
    this.dataService.init();

    // 6. Initialize Slide Controller and activate initial slide cleanly in a single render pass
    this.controller = new SlideController({
      slideDuration: Number(this.rootElement.dataset.slideDuration) || 7000,
      uiHideDelay: Number(this.rootElement.dataset.uiHideDelay) || 3500
    });

    this.controller.registerSlides(this.slides);
    this.controller.init(initialSlideIndex);

    // 7. Handle CDN Chart.js asynchronous readiness check (only if Chart.js wasn't ready yet)
    this.initChartReadinessCheck();
  }

  /**
   * Poll briefly ONLY if Chart.js is not yet loaded via external CDN script.
   * Avoids destroying and re-animating charts that were already rendered cleanly.
   */
  initChartReadinessCheck() {
    const hasRenderedActiveCharts = () => {
      const activeSlide = this.controller?.slides?.[this.controller.currentSlideIndex];
      return Boolean(activeSlide && Array.isArray(activeSlide.charts) && activeSlide.charts.length > 0);
    };

    if (typeof Chart === "undefined") {
      let attempts = 0;
      this._chartChecker = setInterval(() => {
        attempts++;
        if (typeof Chart !== "undefined") {
          clearInterval(this._chartChecker);
          this._chartChecker = null;
          if (!hasRenderedActiveCharts()) {
            this.refreshVisibleCharts();
          }
        } else if (attempts > 30) {
          clearInterval(this._chartChecker);
          this._chartChecker = null;
        }
      }, 150);
    }

    if (document.readyState !== "complete") {
      window.addEventListener("load", () => {
        if (!this.controller) return;
        if (!hasRenderedActiveCharts() && typeof Chart !== "undefined") {
          this.refreshVisibleCharts();
        } else {
          this.resizeVisibleCharts();
        }
      }, { once: true });
    }
  }

  // --- Public APIs for backward compatibility with topbar, sidebar, and global events ---

  showSlide(index) {
    if (this.controller) this.controller.showSlide(index);
  }

  nextSlide() {
    if (this.controller) this.controller.nextSlide();
  }

  previousSlide() {
    if (this.controller) this.controller.previousSlide();
  }

  startSlideshow() {
    if (this.controller) this.controller.startSlideshow();
  }

  stopSlideshow() {
    if (this.controller) this.controller.stopSlideshow();
  }

  restartSlideshow() {
    if (this.controller) this.controller.restartSlideshow();
  }

  togglePause() {
    if (this.controller) this.controller.togglePause();
  }

  refreshVisibleCharts() {
    if (this.controller) this.controller.refreshVisibleCharts();
  }

  resizeVisibleCharts() {
    if (this.controller) this.controller.resizeVisibleCharts();
  }

  showUI() {
    if (this.controller) this.controller.showUI();
  }

  resetUIHideTimer() {
    if (this.controller) this.controller.resetUIHideTimer();
  }

  destroy() {
    if (this._chartChecker) {
      clearInterval(this._chartChecker);
      this._chartChecker = null;
    }
    if (this.controller) {
      this.controller.destroy();
      this.controller = null;
    }
    if (this.dataService) {
      this.dataService.destroy();
      this.dataService = null;
    }
    this.slides = [];
    this.rootElement = null;
  }
}

export { AdminDashboard as SanjeewaAdvertisingDashboard };

// Global initialization with safe readyState handling (prevents duplicate initialization)
const bootDashboard = () => {
  const root = document.getElementById("module-dashboard") || document.querySelector(".dashboard-content");
  if (root) {
    if (root.dataset.dashboardBooted === "1" && window.dashboardInstance) {
      return;
    }
    root.dataset.dashboardBooted = "1";
    if (window.dashboardInstance && typeof window.dashboardInstance.destroy === "function") {
      try {
        window.dashboardInstance.destroy();
      } catch (_) {}
    }
    window.dashboardInstance = window.sanjeewaDashboard = window.adminDashboardInstance = new AdminDashboard();
  } else {
    if (window.dashboardInstance && typeof window.dashboardInstance.destroy === "function") {
      try {
        window.dashboardInstance.destroy();
      } catch (_) {}
      window.dashboardInstance = window.sanjeewaDashboard = window.adminDashboardInstance = null;
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootDashboard, { once: true });
} else {
  bootDashboard();
}
document.addEventListener("turbo:load", bootDashboard);

