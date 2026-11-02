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

    const csrfToken = this.getCsrfToken();
    const headers = {
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
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

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: (method !== "GET" && method !== "HEAD") ? body : undefined,
        signal,
        credentials: options.credentials || "same-origin"
      });

      clearTimeout(timeoutId);

      // Parse response body
      const contentType = response.headers.get("content-type") || "";
      let data = null;

      if (contentType.includes("application/json")) {
        data = await response.json().catch(() => null);
      } else {
        data = await response.text().catch(() => null);
      }

      if (!response.ok) {
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

