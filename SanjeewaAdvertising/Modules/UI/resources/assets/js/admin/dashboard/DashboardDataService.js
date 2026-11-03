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
    const startSSE = () => {
      setTimeout(() => {
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
    window.addEventListener("beforeunload", () => {
      this.disconnectSSE();
    });

    window.addEventListener("pagehide", () => {
      this.disconnectSSE();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // Disconnect SSE while tab is in background to save server resources
        this.disconnectSSE();
      } else if (this.sseUrl && !this.eventSource) {
        // Reconnect SSE when user switches back to the tab
        this.connectSSE(this.sseUrl);
      }
    });
  }

  /**
   * Start periodic background polling for live updates.
   * @param {number} [interval=30000]
   */
  startPolling(interval = 30000) {
    this.stopPolling();
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
          console.warn("[DashboardDataService] SSE closed permanently, falling back to background polling:", err);
          this.disconnectSSE();
          this.startPolling(30000);
        }
      };
    } catch (e) {
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
    try {
      const http = new RequestHandler();
      const json = await http.get(url);
      if (json) {
        this.emitData(json);
      }
    } catch (e) {
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
    this.stopPolling();
    this.disconnectSSE();
    this.callbacks = [];
    this.lastData = null;
  }
}
