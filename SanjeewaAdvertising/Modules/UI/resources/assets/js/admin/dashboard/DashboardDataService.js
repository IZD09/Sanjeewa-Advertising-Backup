/**
 * DashboardDataService
 * Data service for loading and streaming dashboard data via REST API and SSE.
 * Connects directly to backend DashboardService data.
 */

import { RequestHandler } from "../../core/RequestHandler.js";

export class DashboardDataService {
  /**
   * @param {Object} [options={}]
   * @param {string|null} [options.apiUrl]
   * @param {string|null} [options.sseUrl]
   * @param {Object|null} [options.initialData]
   */
  constructor(options = {}) {
    this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    this.days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    this.apiUrl = options.apiUrl || "/dashboard/data";
    this.sseUrl = options.sseUrl || "/dashboard/stream";
    this.initialData = options.initialData || null;
    this.callbacks = [];
    this.eventSource = null;
    this.pollInterval = null;
    this.lastData = null;
  }

  /**
   * Register a subscriber callback for data updates.
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  onData(callback) {
    if (typeof callback === "function") {
      this.callbacks.push(callback);
      if (this.lastData) {
        callback(this.lastData);
      }
    }

    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Broadcast data to all registered listeners.
   * @param {Object} payload
   */
  emitData(payload) {
    if (!payload || typeof payload !== "object") return;

    const raw =
      payload && payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)
        ? payload.data
        : payload;

    this.lastData = this.validateData(raw);

    this.callbacks.forEach(cb => {
      try {
        cb(this.lastData);
      } catch (err) {
        console.error("[DashboardDataService] Callback error:", err);
      }
    });
  }

  /**
   * Initialize data stream: loads initial data, connects SSE asynchronously after page load.
   */
  async init() {
    // 1. Emit server-rendered initial payload immediately if provided
    if (this.initialData && typeof this.initialData === "object" && Object.keys(this.initialData).length > 0) {
      this.emitData(this.initialData);
    } else if (this.apiUrl) {
      // 2. Fetch fresh live data from backend endpoint if no initial payload
      await this.fetchData(this.apiUrl);
    }

    // 3. Connect Server-Sent Events (SSE) asynchronously AFTER the page has completed loading.
    // Delaying EventSource until after 'load' ensures the browser tab's loading spinner
    // completes normally and does not spin perpetually.
    if (this.sseUrl && typeof EventSource !== "undefined") {
      this.scheduleSSEConnection();
    } else {
      // Fallback to polling if EventSource is not supported
      this.startPolling(30000);
    }

    // 4. Ensure SSE is cleanly closed before navigating away or closing the tab
    this.bindLifecycleEvents();
  }

  /**
   * Schedule SSE connection safely after window load event.
   */
  scheduleSSEConnection() {
    if (this._sseTimer) {
      clearTimeout(this._sseTimer);
      this._sseTimer = null;
    }

    const startSSE = () => {
      this._sseTimer = setTimeout(() => {
        // Only connect if dashboard container is currently in the DOM
        const isDashboard = !!(document.getElementById("module-dashboard") || document.querySelector(".dashboard-content"));
        if (!isDashboard) {
          return;
        }
        if (!this.eventSource) {
          this.connectSSE(this.sseUrl);
        }
      }, 500);
    };

    if (document.readyState === "complete") {
      startSSE();
    } else {
      window.addEventListener("load", startSSE, { once: true });
    }
  }

  /**
   * Bind page lifecycle listeners to cleanly disconnect SSE and avoid blocking server threads.
   */
  bindLifecycleEvents() {
    if (this._lifecycleBound) return;
    this._lifecycleBound = true;

    this._onBeforeUnload = () => {
      this.disconnectSSE();
    };

    this._onPageHide = () => {
      this.disconnectSSE();
    };

    this._onVisibilityChange = () => {
      if (document.hidden) {
        // Disconnect SSE while tab is in background to save server resources
        this.disconnectSSE();
      } else if (this.sseUrl && !this.eventSource) {
        // Only reconnect if on active dashboard page
        const isDashboard = !!(document.getElementById("module-dashboard") || document.querySelector(".dashboard-content"));
        if (isDashboard) {
          this.connectSSE(this.sseUrl);
        }
      }
    };

    window.addEventListener("beforeunload", this._onBeforeUnload);
    window.addEventListener("pagehide", this._onPageHide);
    document.addEventListener("visibilitychange", this._onVisibilityChange);
  }

  /**
   * Start periodic background polling for live updates.
   * @param {number} [interval=30000]
   */
  startPolling(interval = 30000) {
    this.stopPolling();
    // Do not start polling if we are no longer on the dashboard
    const isDashboard = !!(document.getElementById("module-dashboard") || document.querySelector(".dashboard-content"));
    if (!isDashboard) return;

    this.pollInterval = setInterval(async () => {
      if (!document.hidden && this.apiUrl) {
        await this.fetchData(this.apiUrl);
      }
    }, interval);
  }

  /**
   * Stop background polling timer.
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Connect to Server-Sent Events (SSE) stream.
   * @param {string} url
   */
  connectSSE(url) {
    this.disconnectSSE();

    // Guard: only connect if on active dashboard
    const isDashboard = !!(document.getElementById("module-dashboard") || document.querySelector(".dashboard-content"));
    if (!isDashboard) return;

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        // When SSE is connected, stop polling fallback if active
        this.stopPolling();
      };

      this.eventSource.onmessage = event => {
        try {
          this.emitData(JSON.parse(event.data));
        } catch (e) {
          console.warn("[DashboardDataService] Failed to parse SSE data:", e);
        }
      };

      this.eventSource.onerror = err => {
        if (this.eventSource && this.eventSource.readyState === EventSource.CLOSED) {
          this.disconnectSSE();

          // If user navigated away or logged out, stop immediately
          const stillOnDashboard = !!(document.getElementById("module-dashboard") || document.querySelector(".dashboard-content"));
          if (!stillOnDashboard) {
            this.destroy();
            return;
          }

          console.warn("[DashboardDataService] SSE closed permanently, falling back to background polling:", err);
          this.startPolling(30000);
        }
      };
    } catch (e) {
      const stillOnDashboard = !!(document.getElementById("module-dashboard") || document.querySelector(".dashboard-content"));
      if (!stillOnDashboard) {
        this.destroy();
        return;
      }
      console.warn("[DashboardDataService] EventSource setup failed, falling back to polling:", e);
      this.startPolling(30000);
    }
  }

  /**
   * Disconnect the active SSE stream.
   */
  disconnectSSE() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Fetch data from HTTP backend endpoint.
   * @param {string} url
   */
  async fetchData(url) {
    const isDashboard = !!(document.getElementById("module-dashboard") || document.querySelector(".dashboard-content"));
    if (!isDashboard) {
      this.destroy();
      return;
    }

    try {
      const http = new RequestHandler();
      const json = await http.get(url);
      if (json) {
        this.emitData(json);
      }
    } catch (e) {
      const errorMsg = (e?.message || "").toLowerCase();
      // If unauthenticated / session expired / unauthorized (401/403), terminate polling immediately
      if (e?.status === 401 || e?.status === 403 || errorMsg.includes("unauthenticated") || errorMsg.includes("unauthorized")) {
        console.warn("[DashboardDataService] Session unauthenticated. Terminating background polling.");
        this.destroy();
        return;
      }
      console.warn("[DashboardDataService] API fetch error:", e);
    }
  }

  /**
   * Merge and validate incoming backend data safely.
   * @param {Object} raw
   * @returns {Object}
   */
  validateData(raw) {
    if (!raw || typeof raw !== "object") {
      return this.getDefaultData();
    }

    return {
      overview: raw.overview || {},
      revenue: raw.revenue || {},
      jobs: raw.jobs || {},
      stock: raw.stock || {},
      finance: raw.finance || {}
    };
  }

  /**
   * Safe empty baseline data structure (no fake metrics).
   * @returns {Object}
   */
  getDefaultData() {
    return {
      overview: {
        states: {
          articles: {
            article1: { value: 0, trendState: "positive", trend: 0, bars: [] },
            article2: { value: 0, trendState: "positive", trend: 0, bars: [] },
            article3: { value: 0, trendState: "positive", trend: 0, bars: [] },
            article4: { value: 0, trendState: "negative", trend: 0, bars: [] }
          },
          chartTitle: new Date().getFullYear(),
          jobStatas: { completed: 0, printing: 0, designing: 0, pending: 0 }
        },
        revenueTrend: { labels: [], values: [] },
        ordersBreakdown: { completed: 0, printing: 0, designing: 0, pending: 0, values: [] }
      },
      revenue: {
        states: {},
        income: {
          labels: [],
          currentYear: new Date().getFullYear(),
          previousYear: new Date().getFullYear() - 1,
          currentYearData: [],
          previousYearData: []
        },
        paymentMethods: { labels: [], values: [] }
      },
      jobs: {
        states: {},
        weeklyOutput: { labels: [], values: [], colors: [] },
        materialUsage: { labels: [], values: [] }
      },
      stock: {
        states: {},
        health: [],
        levels: { labels: [], values: [], colors: [] }
      },
      finance: {
        states: {},
        totalRevenue: "",
        totalExpenses: "",
        netProfit: "",
        profitMargin: 0,
        supplierPayables: "",
        comparison: { labels: [], revenue: [], expenses: [] }
      }
    };
  }

  /**
   * Clean up connections and listeners.
   */
  destroy() {
    if (this._sseTimer) {
      clearTimeout(this._sseTimer);
      this._sseTimer = null;
    }
    this.stopPolling();
    this.disconnectSSE();
    this.callbacks = [];
    this.lastData = null;

    if (this._lifecycleBound) {
      if (this._onBeforeUnload) window.removeEventListener("beforeunload", this._onBeforeUnload);
      if (this._onPageHide) window.removeEventListener("pagehide", this._onPageHide);
      if (this._onVisibilityChange) document.removeEventListener("visibilitychange", this._onVisibilityChange);
      this._lifecycleBound = false;
    }
  }
}
