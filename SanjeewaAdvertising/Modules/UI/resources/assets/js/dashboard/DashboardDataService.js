/**
 * DashboardDataService
 * Simple data service for loading and streaming dashboard data via SSE or REST API.
 */

export class DashboardDataService {
  /**
   * @param {Object} [options={}]
   * @param {string|null} [options.apiUrl]
   * @param {string|null} [options.sseUrl]
   */
  constructor(options = {}) {
    this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    this.days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    this.apiUrl = options.apiUrl || "/dashboard/data";
    this.sseUrl = options.sseUrl || "/dashboard/stream";
    this.callbacks = [];
    this.eventSource = null;
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
    const raw =
      payload && payload.data && typeof payload.data === "object" && payload.data.overview
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
   * Initialize data stream: emits baseline data and connects SSE / API.
   */
  init() {
    // 1. Emit default baseline immediately so UI renders without delay
    this.emitData(this.getDefaultData());

    // 2. Connect to Server-Sent Events (SSE) or fallback to HTTP fetch
    if (this.sseUrl && typeof EventSource !== "undefined") {
      this.connectSSE(this.sseUrl);
    } else if (this.apiUrl) {
      this.fetchData(this.apiUrl);
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

      this.eventSource.onmessage = event => {
        try {
          this.emitData(JSON.parse(event.data));
        } catch (e) {
          console.warn("[DashboardDataService] Failed to parse SSE data:", e);
        }
      };

      this.eventSource.onerror = err => {
        console.warn("[DashboardDataService] SSE error, browser will retry automatically:", err);
      };
    } catch (e) {
      console.warn("[DashboardDataService] EventSource setup failed, falling back to fetch:", e);
      if (this.apiUrl) {
        this.fetchData(this.apiUrl);
      }
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
   * Fetch data from HTTP endpoint.
   * @param {string} url
   */
  async fetchData(url) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest"
        }
      });

      if (response.ok) {
        const json = await response.json();
        this.emitData(json);
      }
    } catch (e) {
      console.warn("[DashboardDataService] API fetch error:", e);
    }
  }

  /**
   * Merge incoming data with default structure safely.
   * @param {Object} raw
   * @returns {Object}
   */
  validateData(raw) {
    if (!raw || typeof raw !== "object") {
      return this.getDefaultData();
    }

    const fallback = this.getDefaultData();

    return {
      overview: { ...fallback.overview, ...(raw.overview || {}) },
      revenue: { ...fallback.revenue, ...(raw.revenue || {}) },
      jobs: { ...fallback.jobs, ...(raw.jobs || {}) },
      stock: { ...fallback.stock, ...(raw.stock || {}) },
      finance: { ...fallback.finance, ...(raw.finance || {}) }
    };
  }

  /**
   * Default baseline data structure for all 5 dashboard slides.
   * @returns {Object}
   */
  getDefaultData() {
    return {
      overview: {
        states: {
          articles: {
            article1: {
              value: 845000,
              trendState: "positive",
              trend: 12.8,
              bars: [30, 45, 35, 62, 50, 78, 95]
            },
            article2: {
              value: 14,
              trendState: "positive",
              trend: 8.4,
              bars: [35, 50, 40, 68, 55, 80, 95]
            },
            article3: {
              value: 14,
              trendState: "positive",
              trend: 4.2,
              bars: [25, 40, 30, 55, 45, 70, 88]
            },
            article4: {
              value: 182500,
              trendState: "negative",
              trend: 3.1,
              bars: [40, 55, 48, 70, 60, 82, 90]
            },
          },
          chartTitle: 2026,
          jobStatas: {
            completed: 14,
            printing: 8,
            designing: 6,
            pending: 4
          }
        },
        revenueTrend: {
          labels: this.months,
          values: [420, 510, 480, 650, 590, 720, 680, 790, 740, 845]
        },
        ordersBreakdown: {
          completed: 14,
          printing: 8,
          designing: 6,
          pending: 4,
          values: [14, 8, 6, 4]
        }
      },
      revenue: {
        states: {

        },
        categories: {
          labels: ["Flex", "Vinyl", "Rollup", "Cards", "Leaflets", "Rigid"],
          currentYear: [340, 260, 180, 120, 95, 65],
          previousYear: [280, 210, 140, 90, 70, 50]
        },
        paymentMethods: {
          labels: ["Cash", "Card", "Bank Transfer", "Online / QR", "Cheque"],
          values: [38, 26, 20, 11, 5]
        }
      },
      jobs: {
        states: {
          
        },
        weeklyOutput: {
          labels: this.days,
          values: [1240, 1680, 1450, 2100, 2480, 1950, 850]
        },
        materialUsage: {
          labels: ["Frontlit", "Star Flex", "Glossy", "Matte", "Backlit"],
          values: [42, 24, 18, 10, 6]
        }
      },
      stock: {
        states: {
          
        },
        health: [
          { name: "Frontlit Flex Banner (10ft)", value: "180m / 250m", percentage: 72, isWarning: false },
          { name: "Glossy Vinyl Sticker (4ft)", value: "42m / 200m (Low)", percentage: 21, isWarning: true },
          { name: "Solvent Cyan Ink Cartridges", value: "85% Full", percentage: 85, isWarning: false },
          { name: "Foam Board Sheets (5mm)", value: "65 Sheets", percentage: 65, isWarning: false }
        ],
        levels: {
          labels: ["Frontlit", "Glossy", "Star Flex", "Ink Cyan", "Foam Board"],
          values: [180, 42, 110, 85, 65],
          colors: ["#10b981", "#ef4444", "#10b981", "#10b981", "#2563eb"]
        }
      },
      finance: {
        states: {
          
        },
        totalRevenue: "Rs. 8.45M",
        totalExpenses: "Rs. 4.68M",
        netProfit: "Rs. 3.77M",
        profitMargin: 44.6,
        supplierPayables: "Rs. 325,000 Due",
        comparison: {
          labels: this.months,
          revenue: [580, 620, 700, 650, 790, 740, 810, 780, 820, 845],
          expenses: [320, 360, 390, 370, 420, 410, 450, 430, 460, 468]
        }
      }
    };
  }

  /**
   * Clean up connections and listeners.
   */
  destroy() {
    this.disconnectSSE();
    this.callbacks = [];
    this.lastData = null;
  }
}
