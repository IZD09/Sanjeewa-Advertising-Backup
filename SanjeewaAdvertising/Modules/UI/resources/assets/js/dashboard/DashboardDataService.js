/**
 * DashboardDataService
 * Responsible for:
 * - Loading dashboard metrics and chart series data from the backend.
 * - Supporting HTTP API fetch requests and/or Server-Sent Events (SSE).
 * - Validating incoming payloads and providing structured defaults.
 * - Emitting updates to registered listeners without touching the DOM.
 * - Graceful error handling, request deduplication, and resource cleanup.
 */

export class DashboardDataService {
  /**
   * @param {Object} [options={}]
   * @param {string|null} [options.apiUrl=null] - Optional HTTP API endpoint.
   * @param {string|null} [options.sseUrl=null] - Optional SSE stream endpoint.
   */
  constructor(options = {}) {
    this.options = options;
    this.apiUrl = options.apiUrl || null;
    this.sseUrl = options.sseUrl || null;

    this.listeners = new Set();
    this.eventSource = null;
    this.abortController = null;
    this.isLoading = false;
    this.lastData = null;
  }

  /**
   * Register a subscriber callback for data updates.
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  onData(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
      if (this.lastData) {
        callback(this.lastData);
      }
    }
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all registered listeners with validated dashboard data.
   * @param {Object} data
   */
  emitData(data) {
    const validated = this.validateData(data);
    this.lastData = validated;
    this.listeners.forEach(listener => {
      try {
        listener(validated);
      } catch (err) {
        console.error('[DashboardDataService] Error in data listener:', err);
      }
    });
  }

  /**
   * Initialize data loading based on options.
   * Emits default baseline data immediately, then connects to API or SSE if configured.
   */
  init() {
    // 1. Emit baseline default data
    this.emitData(this.getDefaultData());

    // 2. Connect to SSE if endpoint provided
    if (this.sseUrl) {
      this.connectSSE(this.sseUrl);
    } else if (this.apiUrl) {
      // 3. Otherwise fetch from HTTP API if endpoint provided
      this.fetchData(this.apiUrl);
    }
  }

  /**
   * Fetch data from an HTTP JSON endpoint.
   * @param {string} [url]
   * @returns {Promise<Object|null>}
   */
  async fetchData(url = this.apiUrl) {
    if (!url || this.isLoading) return null;

    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    this.isLoading = true;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const raw = await response.json();
      this.emitData(raw);
      return this.lastData;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn(`[DashboardDataService] Failed to fetch data from ${url}:`, err);
      }
      return null;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Connect to a Server-Sent Events (SSE) stream endpoint.
   * @param {string} [url]
   */
  connectSSE(url = this.sseUrl) {
    if (!url || typeof EventSource === 'undefined') return;

    this.disconnectSSE();

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onmessage = event => {
        try {
          const payload = JSON.parse(event.data);
          this.emitData(payload);
        } catch (err) {
          console.warn('[DashboardDataService] Malformed SSE JSON data:', err);
        }
      };

      this.eventSource.onerror = err => {
        console.warn('[DashboardDataService] SSE connection error, browser will retry automatically:', err);
      };
    } catch (err) {
      console.warn(`[DashboardDataService] Failed to establish EventSource to ${url}:`, err);
    }
  }

  /**
   * Disconnect the active Server-Sent Events stream.
   */
  disconnectSSE() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Validate and merge incoming raw data with structured fallback defaults.
   * @param {Object} raw
   * @returns {Object}
   */
  validateData(raw) {
    const fallback = this.getDefaultData();
    if (!raw || typeof raw !== 'object') {
      return fallback;
    }

    return {
      overview: {
        totalSales: raw.overview?.totalSales ?? fallback.overview.totalSales,
        activeJobs: raw.overview?.activeJobs ?? fallback.overview.activeJobs,
        newCustomers: raw.overview?.newCustomers ?? fallback.overview.newCustomers,
        pendingInvoices: raw.overview?.pendingInvoices ?? fallback.overview.pendingInvoices,
        revenueTrend: raw.overview?.revenueTrend || fallback.overview.revenueTrend,
        ordersBreakdown: raw.overview?.ordersBreakdown || fallback.overview.ordersBreakdown
      },
      revenue: {
        categories: raw.revenue?.categories || fallback.revenue.categories,
        paymentMethods: raw.revenue?.paymentMethods || fallback.revenue.paymentMethods
      },
      jobs: {
        weeklyOutput: raw.jobs?.weeklyOutput || fallback.jobs.weeklyOutput,
        materialUsage: raw.jobs?.materialUsage || fallback.jobs.materialUsage
      },
      stock: {
        health: Array.isArray(raw.stock?.health) ? raw.stock.health : fallback.stock.health,
        levels: raw.stock?.levels || fallback.stock.levels
      },
      finance: {
        totalRevenue: raw.finance?.totalRevenue ?? fallback.finance.totalRevenue,
        totalExpenses: raw.finance?.totalExpenses ?? fallback.finance.totalExpenses,
        netProfit: raw.finance?.netProfit ?? fallback.finance.netProfit,
        profitMargin: raw.finance?.profitMargin ?? fallback.finance.profitMargin,
        supplierPayables: raw.finance?.supplierPayables ?? fallback.finance.supplierPayables,
        comparison: raw.finance?.comparison || fallback.finance.comparison
      }
    };
  }

  /**
   * Return baseline default dataset matching the current UI slides and charts.
   * @returns {Object}
   */
  getDefaultData() {
    return {
      overview: {
        totalSales: "Rs. 845,000",
        activeJobs: 28,
        newCustomers: 14,
        pendingInvoices: "Rs. 182,500",
        revenueTrend: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
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
        weeklyOutput: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          values: [1240, 1680, 1450, 2100, 2480, 1950, 850]
        },
        materialUsage: {
          labels: ["Frontlit", "Star Flex", "Glossy", "Matte", "Backlit"],
          values: [42, 24, 18, 10, 6]
        }
      },
      stock: {
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
        totalRevenue: "Rs. 8.45M",
        totalExpenses: "Rs. 4.68M",
        netProfit: "Rs. 3.77M",
        profitMargin: 44.6,
        supplierPayables: "Rs. 325,000 Due",
        comparison: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
          revenue: [580, 620, 700, 650, 790, 740, 810, 780, 820, 845],
          expenses: [320, 360, 390, 370, 420, 410, 450, 430, 460, 468]
        }
      }
    };
  }

  /**
   * Clean up open connections, abort controllers, and listener sets.
   */
  destroy() {
    this.disconnectSSE();
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.listeners.clear();
    this.lastData = null;
  }
}

