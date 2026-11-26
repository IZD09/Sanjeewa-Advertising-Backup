/**
 * SanjeewaAdvertising - Core HTTP Request Handler
 *
 * Centralized, reusable HTTP client for sending API and AJAX requests across all modules.
 * - Injects Laravel CSRF token automatically from meta tag, form inputs, or cookies
 * - Configures standard JSON & XMLHttpRequest headers
 * - Serializes object parameters to query strings
 * - Automatically serializes JSON request payloads (supports FormData, Blob, URLSearchParams)
 * - Normalizes HTTP error responses and Laravel validation messages
 * - Supports request timeout and cancellation
 */

/**
 * Global Request Priority Scheduler (Singleton across all RequestHandler instances)
 * - HIGH:   Dispatched immediately; pauses queued LOW requests while in-flight
 * - NORMAL: Standard concurrency-controlled queue (max 6 concurrent)
 * - LOW:    Background concurrency queue (max 2 concurrent), deduplicates identical in-flight GETs,
 *           pauses during active HIGH requests, and cancels queued entries on Turbo navigation.
 */
class RequestPriorityScheduler {
  constructor() {
    this.activeHigh = 0;
    this.activeNormal = 0;
    this.activeLow = 0;
    this.maxNormal = 8;
    this.maxLow = 4;
    this.normalQueue = [];
    this.lowQueue = [];
    this.inFlightLowGets = new Map();

    if (typeof document !== "undefined" && !window.__saRequestPriorityBound) {
      window.__saRequestPriorityBound = true;
      document.addEventListener("turbo:before-visit", () => {
        this.cancelQueuedLow();
      });
    }
  }

  classify(url, method, explicitPriority = null) {
    if (explicitPriority === "high" || explicitPriority === "normal" || explicitPriority === "low") {
      return explicitPriority;
    }

    const lowerUrl = String(url || "").toLowerCase();
    const upperMethod = String(method || "GET").toUpperCase();

    if (
      lowerUrl.includes("live-sync/") ||
      lowerUrl.includes("/notifications") ||
      lowerUrl.includes("/advertising/activities")
    ) {
      return "low";
    }

    if (
      upperMethod !== "GET" &&
      upperMethod !== "HEAD"
    ) {
      return "high";
    }

    if (
      lowerUrl.includes("/login") ||
      lowerUrl.includes("/logout") ||
      lowerUrl.includes("/auth/") ||
      lowerUrl.includes("/session/")
    ) {
      return "high";
    }

    return "normal";
  }

  enqueue(priority, url, method, runner) {
    const upperMethod = String(method || "GET").toUpperCase();

    // Deduplicate identical in-flight LOW GET requests
    if (priority === "low" && upperMethod === "GET" && this.inFlightLowGets.has(url)) {
      return this.inFlightLowGets.get(url);
    }

    if (priority === "high") {
      this.activeHigh++;
      return Promise.resolve()
        .then(runner)
        .finally(() => {
          this.activeHigh = Math.max(0, this.activeHigh - 1);
          this.drain();
        });
    }

    const promise = new Promise((resolve, reject) => {
      const entry = { url, runner, resolve, reject };
      if (priority === "low") {
        this.lowQueue.push(entry);
      } else {
        this.normalQueue.push(entry);
      }
      this.drain();
    });

    if (priority === "low" && upperMethod === "GET") {
      this.inFlightLowGets.set(url, promise);
      promise.finally(() => {
        if (this.inFlightLowGets.get(url) === promise) {
          this.inFlightLowGets.delete(url);
        }
      });
    }

    return promise;
  }

  drain() {
    while (this.activeNormal < this.maxNormal && this.normalQueue.length > 0) {
      const next = this.normalQueue.shift();
      this.activeNormal++;
      Promise.resolve()
        .then(next.runner)
        .then(next.resolve, next.reject)
        .finally(() => {
          this.activeNormal = Math.max(0, this.activeNormal - 1);
          this.drain();
        });
    }

    // Pause queued LOW requests while any HIGH priority request is in-flight
    if (this.activeHigh > 0) {
      return;
    }

    while (this.activeLow < this.maxLow && this.lowQueue.length > 0) {
      const next = this.lowQueue.shift();
      this.activeLow++;
      Promise.resolve()
        .then(next.runner)
        .then(next.resolve, next.reject)
        .finally(() => {
          this.activeLow = Math.max(0, this.activeLow - 1);
          this.drain();
        });
    }
  }

  cancelQueuedLow() {
    while (this.lowQueue.length > 0) {
      const entry = this.lowQueue.shift();
      const err = new Error("Background request cancelled on navigation.");
      err.isCancelled = true;
      entry.reject(err);
    }
  }
}

const globalPriorityScheduler =
  (typeof window !== "undefined" && window.__saRequestPriorityScheduler) ||
  new RequestPriorityScheduler();

if (typeof window !== "undefined") {
  window.__saRequestPriorityScheduler = globalPriorityScheduler;
}

export class RequestHandler {
  /**
   * @param {Object} [config={}]
   * @param {string} [config.baseUrl=""] Base URL prefix for all requests
   * @param {Object} [config.headers={}] Additional default headers
   * @param {number} [config.timeout=30000] Request timeout in milliseconds
   */
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || "";
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 30000;
  }

  /**
   * Extract active Laravel CSRF token.
   * Priority: meta tag > hidden form input > XSRF-TOKEN cookie.
   *
   * @returns {string}
   */
  getCsrfToken() {
    if (typeof document === "undefined") return "";

    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag && metaTag.content) {
      return metaTag.content;
    }

    const inputToken = document.querySelector('input[name="_token"]');
    if (inputToken && inputToken.value) {
      return inputToken.value;
    }

    // Fallback: Read XSRF-TOKEN cookie
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }

    return "";
  }

  /**
   * Combine endpoint with baseUrl and query parameters.
   *
   * @param {string} endpoint
   * @param {Object} [params={}]
   * @returns {string}
   */
  buildUrl(endpoint, params = {}) {
    let url = endpoint;

    if (this.baseUrl && !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("//")) {
      const cleanBase = this.baseUrl.replace(/\/+$/, "");
      const cleanEndpoint = endpoint.replace(/^\/+/, "");
      url = `${cleanBase}/${cleanEndpoint}`;
    }

    if (params && typeof params === "object" && Object.keys(params).length > 0) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => query.append(`${key}[]`, item));
          } else {
            query.append(key, value);
          }
        }
      });
      const queryString = query.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    return url;
  }

  /**
   * Primary HTTP request dispatcher using native Fetch API.
   *
   * @param {string} endpoint
   * @param {Object} [options={}]
   * @returns {Promise<any>}
   */
  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint, options.params);
    const method = (options.method || "GET").toUpperCase();
    const priority = globalPriorityScheduler.classify(url, method, options.priority || null);
    const maxShedRetries = options.maxShedRetries !== undefined ? options.maxShedRetries : 2;

    return globalPriorityScheduler.enqueue(priority, url, method, () =>
      this._executeFetch(url, method, priority, options, maxShedRetries, 0)
    );
  }

  /**
   * Execute fetch with browser priority hint and silent auto-retry on 503 load shedding.
   */
  async _executeFetch(url, method, priority, options, maxShedRetries, attempt) {
    const csrfToken = this.getCsrfToken();
    const headers = {
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-Request-Priority": priority,
      ...this.defaultHeaders,
      ...(options.headers || {})
    };

    if (csrfToken && !headers["X-CSRF-TOKEN"]) {
      headers["X-CSRF-TOKEN"] = csrfToken;
    }

    let body = options.body;
    if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof URLSearchParams)) {
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      body = JSON.stringify(body);
    }

    // Setup Timeout Controller
    const timeoutMs = options.timeout || this.timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let signal = controller.signal;
    if (options.signal) {
      // If external signal is provided, combine with timeout
      signal = options.signal;
    }

    const fetchPriority = priority === "high" ? "high" : (priority === "low" ? "low" : "auto");

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: (method !== "GET" && method !== "HEAD") ? body : undefined,
        signal,
        priority: fetchPriority,
        credentials: options.credentials || "same-origin"
      });

      clearTimeout(timeoutId);

      // Silent auto-retry when backend sheds LOW-priority load (HTTP 503 + X-Load-Shed / Retry-After)
      if (
        response.status === 503 &&
        (response.headers.get("X-Load-Shed") === "1" || response.headers.get("Retry-After")) &&
        attempt < maxShedRetries
      ) {
        const retryAfterSec = Math.max(1, Math.min(10, Number(response.headers.get("Retry-After")) || 2));
        if (typeof options.onShedRetry === "function") {
          try {
            options.onShedRetry({
              attempt: attempt + 1,
              maxRetries: maxShedRetries,
              retryAfterSec,
              url
            });
          } catch (_) {
            // ignore callback errors
          }
        }
        const jitterMs = Math.floor(Math.random() * 400);
        await new Promise((resolve) => setTimeout(resolve, retryAfterSec * 1000 + jitterMs));
        return this._executeFetch(url, method, priority, options, maxShedRetries, attempt + 1);
      }

      // Parse response body
      const contentType = response.headers.get("content-type") || "";
      let data = null;

      if (contentType.includes("application/json")) {
        data = await response.json().catch(() => null);
      } else {
        data = await response.text().catch(() => null);
      }

      if (!response.ok) {
        // If session expired due to inactivity, auto-redirect to the appropriate login page
        if (response.status === 401 && typeof window !== "undefined") {
          const currentPath = window.location.pathname.toLowerCase();
          const isAuthPage = currentPath === "/login" || currentPath.endsWith("/login") || currentPath.includes("/login");
          const isAuthEndpoint = url.includes("/login") || url.includes("/auth/login");

          if (!isAuthPage && !isAuthEndpoint) {
            const redirectTarget =
              (data && typeof data === "object" && data.redirect_url) ||
              (currentPath.startsWith("/admin") ? "/admin/login" : "/login");

            window.location.href = redirectTarget;
          }
        }

        const errorMsg =
          (data && typeof data === "object" && data.message) ||
          (data && typeof data === "object" && data.errors ? Object.values(data.errors).flat().join(" ") : null) ||
          `HTTP Error ${response.status}: ${response.statusText}`;

        const error = new Error(errorMsg);
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = data;
        error.response = response;
        throw error;
      }

      // Broadcast live-sync channels to other open tabs in the same browser after successful mutations
      if (method !== "GET" && method !== "HEAD" && typeof window !== "undefined" && window.LiveSyncManager) {
        const syncedChannelsHeader = response.headers.get("X-Live-Sync-Channels");
        if (syncedChannelsHeader) {
          const channels = syncedChannelsHeader.split(",").map(c => c.trim()).filter(Boolean);
          if (channels.length > 0) {
            window.LiveSyncManager.notifyLocalMutation(channels);
          }
        }
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === "AbortError") {
        const timeoutError = new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
        timeoutError.isTimeout = true;
        throw timeoutError;
      }

      throw err;
    }
  }

  /**
   * HTTP GET shortcut
   * @param {string} endpoint
   * @param {Object} [params={}]
   * @param {Object} [options={}]
   * @returns {Promise<any>}
   */
  async get(endpoint, params = {}, options = {}) {
    return this.request(endpoint, {
      method: "GET",
      params,
      ...options
    });
  }

  /**
   * HTTP POST shortcut
   * @param {string} endpoint
   * @param {any} [data=null]
   * @param {Object} [options={}]
   * @returns {Promise<any>}
   */
  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: data,
      ...options
    });
  }

  /**
   * HTTP PUT shortcut
   * @param {string} endpoint
   * @param {any} [data=null]
   * @param {Object} [options={}]
   * @returns {Promise<any>}
   */
  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: data,
      ...options
    });
  }

  /**
   * HTTP PATCH shortcut
   * @param {string} endpoint
   * @param {any} [data=null]
   * @param {Object} [options={}]
   * @returns {Promise<any>}
   */
  async patch(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: data,
      ...options
    });
  }

  /**
   * HTTP DELETE shortcut
   * @param {string} endpoint
   * @param {Object} [params={}]
   * @param {Object} [options={}]
   * @returns {Promise<any>}
   */
  async delete(endpoint, params = {}, options = {}) {
    return this.request(endpoint, {
      method: "DELETE",
      params,
      ...options
    });
  }

  // Static convenience methods
  static async get(endpoint, params = {}, options = {}) {
    return new RequestHandler().get(endpoint, params, options);
  }

  static async post(endpoint, data = null, options = {}) {
    return new RequestHandler().post(endpoint, data, options);
  }

  static async put(endpoint, data = null, options = {}) {
    return new RequestHandler().put(endpoint, data, options);
  }

  static async patch(endpoint, data = null, options = {}) {
    return new RequestHandler().patch(endpoint, data, options);
  }

  static async delete(endpoint, params = {}, options = {}) {
    return new RequestHandler().delete(endpoint, params, options);
  }
}

export default RequestHandler;

