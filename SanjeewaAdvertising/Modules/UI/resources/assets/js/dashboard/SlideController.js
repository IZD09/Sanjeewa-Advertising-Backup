/**
 * SlideController
 * Manages slideshow navigation, slide registration, lifecycle coordination,
 * autoplay timers, dots/counter updates, keyboard navigation, and UI auto-hide behavior.
 */

export class SlideController {
  /**
   * @param {Object} [options={}]
   * @param {number} [options.slideDuration=7000] - Duration each slide is visible in ms.
   * @param {number} [options.uiHideDelay=3500] - Delay before auto-hiding navigation UI in ms.
   */
  constructor(options = {}) {
    this.options = options;
    this.slideDuration = options.slideDuration || 7000;
    this.uiHideDelay = options.uiHideDelay || 3500;

    this.slides = [];
    this.currentSlideIndex = 0;
    this.isPaused = false;
    this.slideInterval = null;
    this.uiHideTimeout = null;
    this.abortController = new AbortController();

    this.dots = [];
    this.navLinks = [];
    this.counterElem = null;
    this.pauseBtn = null;
    this.resizeObserver = null;
  }

  /**
   * Register a slide instance or array of slide instances.
   * @param {DashboardBaseSlide|DashboardBaseSlide[]} slideOrSlides
   */
  registerSlides(slideOrSlides) {
    if (Array.isArray(slideOrSlides)) {
      this.slides.push(...slideOrSlides);
    } else if (slideOrSlides) {
      this.slides.push(slideOrSlides);
    }
  }

  /**
   * Initialize the controller, DOM elements, and event listeners.
   */
  init() {
    this.dots = [...document.querySelectorAll(".slide-dot")];
    this.navLinks = [...document.querySelectorAll(".nav-link[data-slide]")];
    this.counterElem = document.getElementById("slideCounter");
    this.pauseBtn = document.getElementById("pauseSlides");

    this.bindEvents();
    this.initResizeObserver();
    this.showSlide(0);
    this.startSlideshow();
    this.resetUIHideTimer();
  }

  /**
   * Attach all navigation and user interaction listeners.
   */
  bindEvents() {
    const signal = this.abortController.signal;

    // Previous slide button
    const prevBtn = document.getElementById("previousSlide");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.previousSlide();
        this.restartSlideshow();
        this.showUI();
      }, { signal });
    }

    // Next slide button
    const nextBtn = document.getElementById("nextSlide");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.nextSlide();
        this.restartSlideshow();
        this.showUI();
      }, { signal });
    }

    // Pause / Resume button
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener("click", () => {
        this.togglePause();
      }, { signal });
    }

    // Dot indicators
    this.dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const targetIndex = Number(dot.dataset.index);
        if (!isNaN(targetIndex)) {
          this.showSlide(targetIndex);
          this.restartSlideshow();
          this.showUI();
        }
      }, { signal });
    });

    // Links with [data-slide] attribute
    document.querySelectorAll("[data-slide]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        const targetIndex = Number(link.dataset.slide);
        if (!isNaN(targetIndex)) {
          this.showSlide(targetIndex);
          this.restartSlideshow();
          this.showUI();
        }
      }, { signal });
    });

    // User activity tracking for UI auto-hide
    const onUserActivity = () => {
      if (!window.appRouter || window.appRouter.currentRoute === "dashboard") {
        this.resetUIHideTimer();
      }
    };

    document.addEventListener("mousemove", onUserActivity, { signal });
    document.addEventListener("mousedown", onUserActivity, { signal });
    document.addEventListener("touchstart", onUserActivity, { passive: true, signal });

    // Keyboard navigation
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
    }, { signal });

    // Window visibility (tab switching)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stopSlideshow();
      } else if (!this.isPaused && (!window.appRouter || window.appRouter.currentRoute === "dashboard")) {
        this.startSlideshow();
      }
    }, { signal });

    // Window resize fallback
    window.addEventListener("resize", () => {
      this.resizeVisibleCharts();
    }, { signal });
  }

  /**
   * Observe main content viewport resizing to adjust charts.
   */
  initResizeObserver() {
    if (window.ResizeObserver) {
      let rAF;
      this.resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(() => {
          this.resizeVisibleCharts();
        });
      });

      const mainArea = document.querySelector(".main-area");
      if (mainArea) {
        this.resizeObserver.observe(mainArea);
      }
    }
  }

  /**
   * Activate and display a specific slide by index.
   * @param {number} index
   */
  showSlide(index) {
    if (!this.slides.length) return;

    const previousSlideInstance = this.slides[this.currentSlideIndex];
    if (previousSlideInstance && previousSlideInstance !== this.slides[index]) {
      previousSlideInstance.onSlideLeave();
    }

    this.currentSlideIndex = (index + this.slides.length) % this.slides.length;
    const currentSlideInstance = this.slides[this.currentSlideIndex];

    // Toggle active class on slide elements
    this.slides.forEach((slide, i) => {
      if (slide.element) {
        slide.element.classList.toggle("active", i === this.currentSlideIndex);
      }
    });

    // Toggle active class on dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === this.currentSlideIndex);
    });

    // Update slide counter
    if (this.counterElem) {
      const cur = String(this.currentSlideIndex + 1).padStart(2, "0");
      const tot = String(this.slides.length).padStart(2, "0");
      this.counterElem.textContent = `${cur} / ${tot}`;
    }

    // Update page title, breadcrumb, and sidebar navigation
    const activeEl = currentSlideInstance.element;
    const title = activeEl?.dataset?.title || "Dashboard";
    const navTitle = activeEl?.dataset?.nav || title;

    if (!window.appRouter || window.appRouter.currentRoute === "dashboard") {
      const pageTitle = document.getElementById("pageTitle");
      const breadcrumbTitle = document.getElementById("breadcrumbTitle");
      if (pageTitle) pageTitle.textContent = title;
      if (breadcrumbTitle) breadcrumbTitle.textContent = navTitle;

      this.navLinks.forEach(link => {
        link.classList.toggle(
          "active",
          Number(link.dataset.slide) === this.currentSlideIndex
        );
      });
    }

    // Trigger enter lifecycle on active slide
    currentSlideInstance.onSlideEnter();
  }

  /**
   * Advance to the next slide.
   */
  nextSlide() {
    this.showSlide(this.currentSlideIndex + 1);
  }

  /**
   * Return to the previous slide.
   */
  previousSlide() {
    this.showSlide(this.currentSlideIndex - 1);
  }

  /**
   * Jump directly to a given slide index.
   * @param {number} index
   */
  goToSlide(index) {
    this.showSlide(index);
  }

  /**
   * Start automatic slideshow interval.
   */
  startSlideshow() {
    this.stopSlideshow();

    if (this.isPaused || document.hidden) return;

    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.slideDuration);
  }

  /**
   * Stop automatic slideshow interval.
   */
  stopSlideshow() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  /**
   * Restart automatic slideshow timer.
   */
  restartSlideshow() {
    this.startSlideshow();
  }

  /**
   * Toggle pause/resume state.
   */
  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.pauseBtn) {
      this.pauseBtn.innerHTML = this.isPaused
        ? '<i class="fa-solid fa-play"></i>'
        : '<i class="fa-solid fa-pause"></i>';

      this.pauseBtn.setAttribute(
        "aria-label",
        this.isPaused ? "Resume slideshow" : "Pause slideshow"
      );
    }

    if (this.isPaused) {
      this.stopSlideshow();
    } else {
      this.startSlideshow();
    }

    this.showUI();
  }

  /**
   * Reset UI auto-hide timer.
   */
  resetUIHideTimer() {
    document.body.classList.remove("ui-hidden");
    clearTimeout(this.uiHideTimeout);

    this.uiHideTimeout = setTimeout(() => {
      document.body.classList.add("ui-hidden");
    }, this.uiHideDelay);
  }

  /**
   * Reveal UI elements immediately and reset timer.
   */
  showUI() {
    document.body.classList.remove("ui-hidden");
    this.resetUIHideTimer();
    if (window.topbarController) {
      window.topbarController.showTopbar();
    }
  }

  /**
   * Refresh charts on the currently active slide.
   */
  refreshVisibleCharts() {
    const activeSlide = this.slides[this.currentSlideIndex];
    if (activeSlide && typeof activeSlide.refreshCharts === "function") {
      activeSlide.refreshCharts();
    }
  }

  /**
   * Resize charts on the currently active visible slide.
   */
  resizeVisibleCharts() {
    const activeSlide = this.slides[this.currentSlideIndex];
    if (activeSlide && typeof activeSlide.resizeCharts === "function") {
      activeSlide.resizeCharts();
    }
  }

  /**
   * Clean up all timers, observers, and event listeners.
   */
  destroy() {
    this.stopSlideshow();
    clearTimeout(this.uiHideTimeout);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.abortController.abort();
    this.slides.forEach(slide => slide.destroy());
    this.slides = [];
  }
}

