/**
 * SanjeewaAdvertising - Core Live Sync Manager (Optimized Option 2 Architecture)
 *
 * Lightweight, zero-dependency real-time synchronization built for 60-150+ concurrent users:
 * - Same-Browser Tab Leader Election: only 1 tab per browser polls the server and shares
 *   updates with all other open tabs via BroadcastChannel
 * - 8s Base Interval + Random Jitter (±1.5s): prevents synchronized polling spikes
 * - ETag / If-None-Match (HTTP 304 Not Modified): 0-byte server responses when nothing changed
 * - Staggered Reload Delay (200ms–1500ms): prevents DB thundering herd when an update occurs
 * - Sends X-Background-Poll: 1 so session inactivity timeout is never reset
 * - Auto-pauses when browser tab is hidden and syncs immediately upon return
 * - Safe with Hotwire Turbo navigation
 */

export class LiveSyncManager {
  static _instance = null;

  /**
   * @param {Object} [options={}]
   * @param {string} [options.endpoint="/advertising/live-sync/versions"]
   * @param {number} [options.intervalMs=8000]
   * @param {number} [options.jitterMs=1500]
   * @param {number} [options.staggerMinMs=200]
   * @param {number} [options.staggerMaxMs=1500]
   * @param {string} [options.broadcastChannelName="sanjeewa_live_sync"]
   */
  constructor(options = {}) {
    this.endpoint = options.endpoint || "/advertising/live-sync/versions";
    this.intervalMs = options.intervalMs || 8000;
    this.jitterMs = options.jitterMs ?? 1500;
    this.staggerMinMs = options.staggerMinMs ?? 200;
    this.staggerMaxMs = options.staggerMaxMs ?? 1500;
    this.broadcastChannelName = options.broadcastChannelName || "sanjeewa_live_sync";
    this.leaderStorageKey = "sanjeewa_live_sync_leader";
    this.leaderLeaseMs = Math.max(15000, this.intervalMs * 2);

    /** @type {Map<string, { key: string, channels: string[], callback: Function, isRunning: boolean, pendingRerun: boolean, staggerTimerId: number|null }>} */
    this.subscriptions = new Map();

    /** @type {Record<string, number>} */
    this.knownVersions = {};

    this.lastEtag = "";
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
   * @param {string} [options.key]
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
    return LiveSyncManager.getInstance().checkVersions({ forcePoll: true });
  }

  /**
   * Initialize browser BroadcastChannel for leader-to-follower sync & instant local mutations.
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
          this.triggerSubscribersForChannels(msg.channels, { immediate: true });
        } else if (msg.type === "versions" && msg.versions && typeof msg.versions === "object") {
          if (msg.etag) {
            this.lastEtag = msg.etag;
          }
          this.applyVersionMap(msg.versions, { baselineOnly: !this.hasInitializedVersions, immediate: false });
        }
      };
    } catch (err) {
      console.warn("[LiveSyncManager] BroadcastChannel unavailable:", err);
    }
  }

  /**
   * Bind visibility, Turbo navigation, and unload listeners.
   * @private
   */
  bindLifecycleEvents() {
    if (typeof document === "undefined") return;

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.releaseLeadership();
        this.stopPolling();
      } else if (this.subscriptions.size > 0) {
        this.checkVersions({ forcePoll: true });
        this.scheduleNextPoll();
      }
    });

    document.addEventListener("turbo:before-visit", () => {
      this.clearAllSubscriptions();
    });

    window.addEventListener("beforeunload", () => {
      this.releaseLeadership();
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
   * Attempt to claim or renew the single-tab poller leadership lease for this browser.
   *
   * @returns {boolean} True if this tab is the active leader
   */
  tryAcquireLeadership() {
    if (typeof localStorage === "undefined") {
      return true;
    }

    try {
      const now = Date.now();
      const raw = localStorage.getItem(this.leaderStorageKey);
      if (raw) {
        const current = JSON.parse(raw);
        if (current && current.tabId !== this.tabId && Number(current.expiresAt) > now) {
          return false;
        }
      }

      localStorage.setItem(
        this.leaderStorageKey,
        JSON.stringify({
          tabId: this.tabId,
          expiresAt: now + this.leaderLeaseMs,
        })
      );
      return true;
    } catch (_) {
      return true;
    }
  }

  /**
   * Release leadership lease if this tab currently holds it.
   */
  releaseLeadership() {
    if (typeof localStorage === "undefined") return;

    try {
      const raw = localStorage.getItem(this.leaderStorageKey);
      if (raw) {
        const current = JSON.parse(raw);
        if (current && current.tabId === this.tabId) {
          localStorage.removeItem(this.leaderStorageKey);
        }
      }
    } catch (_) {
      // ignore storage errors
    }
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

    const existing = this.subscriptions.get(key);
    if (existing && existing.staggerTimerId) {
      clearTimeout(existing.staggerTimerId);
    }

    this.subscriptions.set(key, {
      key,
      channels: channelList,
      callback,
      isRunning: false,
      pendingRerun: false,
      staggerTimerId: null,
    });

    // Establish baseline versions on first mount, then start jittered polling loop
    this.checkVersions({ baselineOnly: !this.hasInitializedVersions, forcePoll: !this.hasInitializedVersions });
    this.scheduleNextPoll();

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
    const sub = this.subscriptions.get(key);
    if (sub && sub.staggerTimerId) {
      clearTimeout(sub.staggerTimerId);
    }
    this.subscriptions.delete(key);

    if (this.subscriptions.size === 0) {
      this.releaseLeadership();
      this.stopPolling();
    }
  }

  /**
   * Clear all active page subscriptions (used on Turbo page navigation).
   */
  clearAllSubscriptions() {
    this.subscriptions.forEach((sub) => {
      if (sub.staggerTimerId) {
        clearTimeout(sub.staggerTimerId);
      }
    });
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

    // Reset ETag so the next server poll fetches the freshly bumped versions cleanly
    this.lastEtag = "";

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
   * Schedule the next poll with random jitter (±jitterMs) to spread load smoothly.
   */
  scheduleNextPoll() {
    if (this.timerId || this.subscriptions.size === 0) return;
    if (typeof document !== "undefined" && document.hidden) return;

    const jitterOffset = Math.round((Math.random() * 2 - 1) * this.jitterMs);
    const delay = Math.max(3000, this.intervalMs + jitterOffset);

    this.timerId = setTimeout(async () => {
      this.timerId = null;
      if (typeof document !== "undefined" && document.hidden) {
        return;
      }
      if (this.subscriptions.size === 0) {
        return;
      }

      await this.checkVersions();
      this.scheduleNextPoll();
    }, delay);
  }

  /**
   * Stop scheduled polling timer.
   */
  stopPolling() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Query the lightweight cache-backed versions endpoint (only when this tab is the leader).
   * Uses ETag / If-None-Match for 0-byte HTTP 304 Not Modified responses when unchanged.
   *
   * @param {Object} [options={}]
   * @param {boolean} [options.baselineOnly=false]
   * @param {boolean} [options.forcePoll=false]
   */
  async checkVersions({ baselineOnly = false, forcePoll = false } = {}) {
    if (this.isChecking || this.subscriptions.size === 0) return;

    // Only the elected leader tab polls the server (unless baseline/forced)
    const isLeader = this.tryAcquireLeadership();
    if (!isLeader && !forcePoll) {
      return;
    }

    // Defer background poll if a critical HIGH-priority request is currently in-flight
    if (typeof window !== "undefined" && window.__saRequestPriorityScheduler?.activeHigh > 0) {
      return;
    }

    this.isChecking = true;

    try {
      const headers = {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-Background-Poll": "1",
        "X-Request-Priority": "low",
      };

      if (this.lastEtag && !baselineOnly) {
        headers["If-None-Match"] = this.lastEtag;
      }

      // Leader polls all channels in one tiny cache read so all follower tabs receive updates
      const response = await fetch(`${this.endpoint}?channels=all`, {
        method: "GET",
        credentials: "same-origin",
        priority: "low",
        headers,
      });

      // 304 Not Modified -> 0 bytes transferred, nothing changed!
      if (response.status === 304) {
        this.hasInitializedVersions = true;
        return;
      }

      // 503 Load Shedding -> silently skip this tick; next scheduled poll will retry automatically
      if (response.status === 503) {
        return;
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.releaseLeadership();
          this.stopPolling();
        }
        return;
      }

      const responseEtag = response.headers.get("ETag") || "";
      if (responseEtag) {
        this.lastEtag = responseEtag;
      }

      const json = await response.json().catch(() => null);
      const versions = json?.data?.versions || json?.versions;
      if (!versions || typeof versions !== "object") {
        return;
      }

      // Share freshly polled versions with all follower tabs in the same browser
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({
            type: "versions",
            sender: this.tabId,
            versions,
            etag: responseEtag,
          });
        } catch (_) {
          // ignore
        }
      }

      this.applyVersionMap(versions, { baselineOnly, immediate: false });
    } catch (_) {
      // Silently ignore transient network blips during background sync
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Compare incoming version map against locally known versions and trigger changed subscribers.
   *
   * @private
   * @param {Record<string, number>} versions
   * @param {Object} [options={}]
   */
  applyVersionMap(versions, { baselineOnly = false, immediate = false } = {}) {
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
      this.triggerSubscribersForChannels(changedChannels, { immediate });
    }
  }

  /**
   * Execute callbacks for any subscriptions matching the changed channels.
   * Applies staggered random delay (200ms–1500ms) on remote updates to prevent DB spikes.
   *
   * @param {string[]} changedChannels
   * @param {Object} [options={}]
   * @param {boolean} [options.immediate=false]
   */
  triggerSubscribersForChannels(changedChannels, { immediate = false } = {}) {
    const changedSet = new Set(changedChannels.map((c) => String(c).toLowerCase()));

    this.subscriptions.forEach((sub) => {
      const matched = sub.channels.some((c) => changedSet.has(c));
      if (!matched) return;

      if (sub.isRunning) {
        sub.pendingRerun = true;
        return;
      }

      if (immediate) {
        if (sub.staggerTimerId) {
          clearTimeout(sub.staggerTimerId);
          sub.staggerTimerId = null;
        }
        this.runSubscriptionCallback(sub, changedChannels);
        return;
      }

      // Stagger remote reloads across 200ms–1500ms to eliminate thundering herd DB spikes
      if (sub.staggerTimerId) {
        return; // already scheduled
      }

      const staggerDelay =
        this.staggerMinMs + Math.floor(Math.random() * Math.max(0, this.staggerMaxMs - this.staggerMinMs));

      sub.staggerTimerId = setTimeout(() => {
        sub.staggerTimerId = null;
        if (!this.subscriptions.has(sub.key)) return;
        this.runSubscriptionCallback(sub, changedChannels);
      }, staggerDelay);
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
