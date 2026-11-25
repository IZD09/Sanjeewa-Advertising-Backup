/**
 * DashboardDataService
 * Data service for loading and streaming dashboard data via REST API and SSE.
 * Connects directly to backend DashboardService data.
 */

import { RequestHandler } from "../../core/RequestHandler.js";
import { LiveSyncManager } from "../../core/LiveSyncManager.js";

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
    this.sseUrl = options.sseUrl || null;
    this.initialData = options.initialData || null;
    this.callbacks = [];
    this.eventSource = null;
    this.pollInterval = null;
    this._unsubscribeLiveSync = null;
    this.lastData = null;
    this._lastPayloadHash = null;
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

    const serialized = JSON.stringify(raw);
    if (this._lastPayloadHash === serialized) {
      return;
    }
    this._lastPayloadHash = serialized;

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
   * Initialize dashboard data and subscribe to centralized LiveSyncManager.
   */
  async init() {
    // 1. Emit server-rendered initial payload immediately if provided
    if (this.initialData && typeof this.initialData === "object" && Object.keys(this.initialData).length > 0) {
      this.emitData(this.initialData);
    } else if (this.apiUrl) {
      // 2. Fetch fresh live data from backend endpoint if no initial payload
      await this.fetchData(this.apiUrl);
    }

    // 3. Subscribe to centralized LiveSyncManager (ETag 304 + tab leader election, zero SSE blocking)
    this.disconnectSSE();
    this._unsubscribeLiveSync = LiveSyncManager.subscribe(
      ["dashboard", "orders", "print_jobs", "payments", "inventory", "grn", "customers"],
      async () => {
        if (this.apiUrl) {
          await this.fetchData(this.apiUrl);
        }
      },
      { key: "dashboard-live-sync" }
    );
  }

  /**
   * Stop any active live-sync subscription (keeps legacy method name for compatibility).
   */
  disconnectSSE() {
    if (typeof this._unsubscribeLiveSync === "function") {
      this._unsubscribeLiveSync();
      this._unsubscribeLiveSync = null;
    }
  }

  stopPolling() {
    this.disconnectSSE();
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
    this._lastPayloadHash = null;

    if (this._lifecycleBound) {
      if (this._onBeforeUnload) window.removeEventListener("beforeunload", this._onBeforeUnload);
      if (this._onPageHide) window.removeEventListener("pagehide", this._onPageHide);
      if (this._onVisibilityChange) document.removeEventListener("visibilitychange", this._onVisibilityChange);
      this._lifecycleBound = false;
    }
  }
}
