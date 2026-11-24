/**
 * SanjeewaAdvertising - Core Live Sync Manager (Option 2 Architecture)
 *
 * Lightweight, zero-dependency real-time synchronization across all users and tabs:
 * - Polls GET /api/v1/live-sync/versions (Cache-backed, zero DB queries) every 4s
 * - Sends X-Background-Poll: 1 so session inactivity timeout is never reset
 * - Only invokes subscribed page refresh callbacks when a channel's version increases
 * - Uses browser BroadcastChannel for instant (<5ms) cross-tab sync on the same PC
 * - Automatically pauses polling when the browser tab is hidden and syncs immediately on return
 * - Safe with Hotwire Turbo navigation (prevents duplicate listeners and memory leaks)
 */

export class LiveSyncManager {
  static _instance = null;

  /**
   * @param {Object} [options={}]
   * @param {string} [options.endpoint="/api/v1/live-sync/versions"]
   * @param {number} [options.intervalMs=4000]
   * @param {string} [options.broadcastChannelName="sanjeewa_live_sync"]
   */
  constructor(options = {}) {
    this.endpoint = options.endpoint || "/api/v1/live-sync/versions";
    this.intervalMs = options.intervalMs || 4000;
    this.broadcastChannelName = options.broadcastChannelName || "sanjeewa_live_sync";

    /** @type {Map<string, { key: string, channels: string[], callback: Function, isRunning: boolean, pendingRerun: boolean }>} */
    this.subscriptions = new Map();

    /** @type {Record<string, number>} */
    this.knownVersions = {};

    this.timerId = null;
    this.isChecking = false;
    this.hasInitializedVersions = false;
    this.tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.broadcastChannel = null;

    this.initBroadcastChannel();
    this.bindLifecycleEvents();
  }

  /**
   * Retrieve the global singleton instance.
   *
   * @returns {LiveSyncManager}
   */
  static getInstance() {
    if (!LiveSyncManager._instance) {
      LiveSyncManager._instance = new LiveSyncManager();
    }
    return LiveSyncManager._instance;
  }

  /**
   * Subscribe a page/module to one or more live-sync channels.
   *
   * @param {string|string[]} channels
   * @param {Function} callback
   * @param {Object} [options={}]
   * @param {string} [options.key] Unique key to prevent duplicate subscriptions on Turbo reloads
   * @returns {Function} Unsubscribe function
   */
  static subscribe(channels, callback, options = {}) {
    return LiveSyncManager.getInstance().subscribe(channels, callback, options);
  }

  /**
   * Broadcast a local mutation to other open tabs on the same browser immediately.
   *
   * @param {string|string[]} channels
   */
  static notifyLocalMutation(channels) {
    LiveSyncManager.getInstance().notifyLocalMutation(channels);
  }

  /**
   * Trigger an immediate version check.
   */
  static checkNow() {
    return LiveSyncManager.getInstance().checkVersions();
  }

  /**
   * Initialize browser BroadcastChannel for instant same-browser multi-tab sync.
   * @private
   */
  initBroadcastChannel() {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return;
    }

    try {
      this.broadcastChannel = new BroadcastChannel(this.broadcastChannelName);
      this.broadcastChannel.onmessage = (event) => {
        const msg = event?.data;
        if (!msg || msg.sender === this.tabId) return;

        if (msg.type === "mutation" && Array.isArray(msg.channels) && msg.channels.length > 0) {
          this.triggerSubscribersForChannels(msg.channels);
        }
      };
    } catch (err) {
      console.warn("[LiveSyncManager] BroadcastChannel unavailable:", err);
    }
  }

  /**
   * Bind visibility and Turbo lifecycle listeners.
   * @private
   */
  bindLifecycleEvents() {
    if (typeof document === "undefined") return;

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stopPolling();
      } else if (this.subscriptions.size > 0) {
        this.checkVersions();
        this.startPolling();
      }
    });

    // Clear page-scoped subscriptions before Turbo swaps the body
    document.addEventListener("turbo:before-visit", () => {
      this.clearAllSubscriptions();
    });

    window.addEventListener("beforeunload", () => {
      this.stopPolling();
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.close();
        } catch (_) {
          // ignore
        }
      }
    });
  }

  /**
   * Register a subscription for one or more channels.
   *
   * @param {string|string[]} channels
   * @param {Function} callback
   * @param {Object} [options={}]
   * @returns {Function} Unsubscribe callback
   */
  subscribe(channels, callback, options = {}) {
    if (typeof callback !== "function") {
      return () => {};
    }

    const channelList = (Array.isArray(channels) ? channels : [channels])
      .map((c) => String(c || "").trim().toLowerCase())
      .filter(Boolean);

    if (channelList.length === 0) {
      return () => {};
    }

    const key = options.key || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    this.subscriptions.set(key, {
      key,
      channels: channelList,
      callback,
      isRunning: false,
      pendingRerun: false,
    });

    // Fetch baseline versions for newly added channels, then start polling
    this.checkVersions({ baselineOnly: !this.hasInitializedVersions });
    this.startPolling();

    return () => {
      this.unsubscribe(key);
    };
  }

  /**
   * Remove a subscription by key.
   *
   * @param {string} key
   */
  unsubscribe(key) {
    this.subscriptions.delete(key);
    if (this.subscriptions.size === 0) {
      this.stopPolling();
    }
  }

  /**
   * Clear all active page subscriptions (used on Turbo page navigation).
   */
  clearAllSubscriptions() {
    this.subscriptions.clear();
    this.stopPolling();
  }

  /**
   * Notify other tabs in the same browser immediately after a local write succeeds.
   *
   * @param {string|string[]} channels
   */
  notifyLocalMutation(channels) {
    const channelList = (Array.isArray(channels) ? channels : [channels])
      .map((c) => String(c || "").trim().toLowerCase())
      .filter(Boolean);

    if (channelList.length === 0) return;

    // Also advance our local known version check quietly so this tab doesn't double-refresh
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: "mutation",
          sender: this.tabId,
          channels: channelList,
          timestamp: Date.now(),
        });
      } catch (_) {
        // ignore closed channel errors
      }
    }
  }

  /**
   * Start periodic lightweight version checks.
   */
  startPolling() {
    if (this.timerId || this.subscriptions.size === 0) return;
    if (typeof document !== "undefined" && document.hidden) return;

    this.timerId = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) {
        return;
      }
      this.checkVersions();
    }, this.intervalMs);
  }

  /**
   * Stop periodic version checks.
   */
  stopPolling() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Collect all unique channel names currently subscribed on this page.
   *
   * @returns {string[]}
   */
  getSubscribedChannels() {
    const set = new Set();
    this.subscriptions.forEach((sub) => {
      sub.channels.forEach((c) => set.add(c));
    });
    return Array.from(set);
  }

  /**
   * Query the lightweight cache-backed versions endpoint and refresh only changed channels.
   *
   * @param {Object} [options={}]
   * @param {boolean} [options.baselineOnly=false]
   */
  async checkVersions({ baselineOnly = false } = {}) {
    if (this.isChecking || this.subscriptions.size === 0) return;

    const channels = this.getSubscribedChannels();
    if (channels.length === 0) return;

    this.isChecking = true;

    try {
      const url = `${this.endpoint}?channels=${encodeURIComponent(channels.join(","))}`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-Background-Poll": "1",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.stopPolling();
        }
        return;
      }

      const json = await response.json().catch(() => null);
      const versions = json?.data?.versions || json?.versions;
      if (!versions || typeof versions !== "object") {
        return;
      }

      const changedChannels = [];

      Object.entries(versions).forEach(([channel, rawVersion]) => {
        const version = Number(rawVersion) || 0;
        const previous = this.knownVersions[channel];

        if (previous === undefined) {
          this.knownVersions[channel] = version;
        } else if (version > previous) {
          this.knownVersions[channel] = version;
          if (!baselineOnly) {
            changedChannels.push(channel);
          }
        }
      });

      this.hasInitializedVersions = true;

      if (changedChannels.length > 0) {
        this.triggerSubscribersForChannels(changedChannels);
      }
    } catch (_) {
      // Silently ignore transient network blips during background sync
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Execute callbacks for any subscriptions matching the changed channels.
   * Guards against overlapping concurrent executions per subscription.
   *
   * @param {string[]} changedChannels
   */
  triggerSubscribersForChannels(changedChannels) {
    const changedSet = new Set(changedChannels.map((c) => String(c).toLowerCase()));

    this.subscriptions.forEach((sub) => {
      const matched = sub.channels.some((c) => changedSet.has(c));
      if (!matched) return;

      if (sub.isRunning) {
        sub.pendingRerun = true;
        return;
      }

      this.runSubscriptionCallback(sub, changedChannels);
    });
  }

  /**
   * Safely run a subscriber callback with in-flight protection.
   *
   * @private
   * @param {Object} sub
   * @param {string[]} changedChannels
   */
  async runSubscriptionCallback(sub, changedChannels) {
    sub.isRunning = true;
    sub.pendingRerun = false;

    try {
      await sub.callback({ channels: changedChannels });
    } catch (err) {
      console.warn(`[LiveSyncManager] Refresh callback error (${sub.key}):`, err);
    } finally {
      sub.isRunning = false;
      if (sub.pendingRerun && this.subscriptions.has(sub.key)) {
        sub.pendingRerun = false;
        this.runSubscriptionCallback(sub, changedChannels);
      }
    }
  }
}

if (typeof window !== "undefined") {
  window.LiveSyncManager = LiveSyncManager;
}

export default LiveSyncManager;
