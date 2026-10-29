/**
 * SanjeewaAdvertising Dashboard Entry Point
 * Orchestrates:
 * DashboardDataService -> dashboard.js -> SlideController / Slide Instances
 */

import { DashboardDataService } from './dashboard/DashboardDataService.js';
import { SlideController } from './dashboard/SlideController.js';
import { DashboardOverviewSlide } from './dashboard/slides/DashboardOverviewSlide.js';
import { RevenueComparisonSlide } from './dashboard/slides/RevenueComparisonSlide.js';
import { JobStatusSlide } from './dashboard/slides/JobStatusSlide.js';
import { StockCategoriesSlide } from './dashboard/slides/StockCategoriesSlide.js';
import { FinancialPerformanceSlide } from './dashboard/slides/FinancialPerformanceSlide.js';

export class SanjeewaAdvertisingDashboard {
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
    const apiUrl = this.rootElement.dataset.apiUrl || null;
    const sseUrl = this.rootElement.dataset.sseUrl || null;
    this.dataService = new DashboardDataService({ apiUrl, sseUrl });

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
          slide.render(data);
        } catch (err) {
          console.error(`[Dashboard] Error rendering slide ${slide.name}:`, err);
        }
      });
    });

    // 4. Initialize Slide Controller
    this.controller = new SlideController({
      slideDuration: Number(this.rootElement.dataset.slideDuration) || 7000,
      uiHideDelay: Number(this.rootElement.dataset.uiHideDelay) || 3500
    });

    this.controller.registerSlides(this.slides);
    this.controller.init();

    // 5. Initialize Data Service (emits baseline data, connects to API/SSE if configured)
    this.dataService.init();

    // 6. Handle CDN Chart.js asynchronous readiness check
    this.initChartReadinessCheck();
  }

  /**
   * Poll briefly if Chart.js is loaded asynchronously via external CDN script.
   */
  initChartReadinessCheck() {
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
    }, { once: true });
  }

  // --- Public APIs for backward compatibility with topbar, sidebar, and global events ---

  /**
   * Show a slide by index.
   * @param {number} index
   */
  showSlide(index) {
    if (this.controller) this.controller.showSlide(index);
  }

  /**
   * Advance to the next slide.
   */
  nextSlide() {
    if (this.controller) this.controller.nextSlide();
  }

  /**
   * Return to previous slide.
   */
  previousSlide() {
    if (this.controller) this.controller.previousSlide();
  }

  /**
   * Start slideshow autoplay.
   */
  startSlideshow() {
    if (this.controller) this.controller.startSlideshow();
  }

  /**
   * Stop slideshow autoplay.
   */
  stopSlideshow() {
    if (this.controller) this.controller.stopSlideshow();
  }

  /**
   * Restart slideshow autoplay.
   */
  restartSlideshow() {
    if (this.controller) this.controller.restartSlideshow();
  }

  /**
   * Toggle pause/resume state.
   */
  togglePause() {
    if (this.controller) this.controller.togglePause();
  }

  /**
   * Refresh charts on the active slide (e.g. called on theme toggle).
   */
  refreshVisibleCharts() {
    if (this.controller) this.controller.refreshVisibleCharts();
  }

  /**
   * Resize charts on all slides.
   */
  resizeVisibleCharts() {
    if (this.controller) this.controller.resizeVisibleCharts();
  }

  /**
   * Show navigation UI and reset auto-hide timer.
   */
  showUI() {
    if (this.controller) this.controller.showUI();
  }

  /**
   * Reset UI auto-hide timer.
   */
  resetUIHideTimer() {
    if (this.controller) this.controller.resetUIHideTimer();
  }

  /**
   * Destroy all controller resources, data connections, and slide instances.
   */
  destroy() {
    if (this.controller) {
      this.controller.destroy();
      this.controller = null;
    }
    if (this.dataService) {
      this.dataService.destroy();
      this.dataService = null;
    }
    this.slides = [];
  }
}

// Global initialization on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.dashboardInstance = window.sanjeewaDashboard = new SanjeewaAdvertisingDashboard();
});
