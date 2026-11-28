/**
 * SanjeewaAdvertising - Admin Transport & Fleet Management Controller
 *
 * Orchestrates /admin/transport tabs, filters, vehicle registration, driver assignment,
 * transport dispatch lifecycle, diesel consumption logging, and LiveSyncManager updates.
 */

"use strict";

import { LiveSyncManager } from "../../core/LiveSyncManager.js";
import { ConfirmModalHelper } from "../../core/ConfirmModalHelper.js";
import { TransportDataService } from "./TransportDataService.js";
import { TransportTableRenderer } from "./TransportTableRenderer.js";
import { TransportModalsController } from "./TransportModalsController.js";

export class TransportManager {
  constructor() {
    this.root = document.getElementById("module-transport");
    if (!this.root) return;

    this.state = window.__INITIAL_TRANSPORT_DATA__ || {
      kpi: {},
      dispatches: [],
      vehicles: [],
      models: [],
      drivers: [],
      all_staff: [],
      diesel_prices: [],
      deliverable_jobs: [],
    };

    this.tripFilters = {
      search: "",
      status: "ALL",
      vehicleId: "ALL",
      date: "",
    };

    this.vehicleFilters = {
      search: "",
      status: "ALL",
    };

    this.driverSearch = "";

    this.dataService = new TransportDataService();
    this.renderer = new TransportTableRenderer();
    this.modals = new TransportModalsController({
      getState: () => this.state,
      dataService: this.dataService,
      onMutated: () => this.refreshData(),
      showToast: (msg, type) => this.showToast(msg, type),
    });

    this.init();
  }

  init() {
    if (window.sidebarComponent) {
      window.sidebarComponent.setActiveRoute("transport");
    }

    this.bindTabs();
    this.bindHeaderAndToolbarActions();
    this.bindFilters();
    this.bindTableActions();

    this.renderAll();

    if (!window.__INITIAL_TRANSPORT_DATA__) {
      this.refreshData();
    }

    LiveSyncManager.subscribe(
      ["transport", "hr"],
      () => {
        this.refreshData();
      },
      { key: "admin-transport-live-sync" }
    );
  }

  async refreshData() {
    try {
      const fresh = await this.dataService.fetchDashboardData();
      if (fresh) {
        this.state = fresh;
        this.renderAll();
      }
    } catch (err) {
      // Non-blocking refresh failure
    }
  }

  renderAll() {
    this.renderer.renderKpis(this.state.kpi || {});
    this.renderer.renderTabBadges(this.state);
    this.renderer.populateVehicleFilterDropdown(this.state.vehicles || []);
    this.renderer.renderDispatches(this.state.dispatches || [], this.tripFilters);
    this.renderer.renderVehicles(this.state.vehicles || [], this.vehicleFilters);
    this.renderer.renderDrivers(this.state.drivers || [], this.driverSearch);
    this.renderer.renderDieselPrices(this.state.diesel_prices || []);
  }

  bindTabs() {
    const buttons = this.root.querySelectorAll("[data-trp-tab]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-trp-tab");
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        this.root.querySelectorAll(".trp-tab-pane").forEach((pane) => {
          pane.style.display = pane.id === targetId ? "block" : "none";
          pane.classList.toggle("active", pane.id === targetId);
        });
      });
    });
  }

  bindHeaderAndToolbarActions() {
    const openAddVehicle = () => this.modals.openVehicleModal(null);
    const openStartDispatch = () => this.modals.openStartDispatchModal(null);
    const openDiesel = () => this.modals.openDieselPriceModal();
    const openAddDriver = () => this.modals.openAddDriverModal();

    document.getElementById("btnOpenAddVehicleModal")?.addEventListener("click", openAddVehicle);
    document.getElementById("btnToolbarAddVehicle")?.addEventListener("click", openAddVehicle);

    document.getElementById("btnOpenStartDispatchModal")?.addEventListener("click", openStartDispatch);
    document.getElementById("btnToolbarStartDispatch")?.addEventListener("click", openStartDispatch);

    document.getElementById("btnOpenDieselModal")?.addEventListener("click", openDiesel);
    document.getElementById("btnToolbarUpdateDiesel")?.addEventListener("click", openDiesel);

    document.getElementById("btnOpenAddDriverModal")?.addEventListener("click", openAddDriver);
    document.getElementById("btnToolbarAddDriver")?.addEventListener("click", openAddDriver);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.modals.closeAll();
      }
    });
  }

  bindFilters() {
    document.getElementById("trpSearchDispatches")?.addEventListener("input", (e) => {
      this.tripFilters.search = e.target.value;
      this.renderer.renderDispatches(this.state.dispatches || [], this.tripFilters);
    });

    document.getElementById("trpFilterTripStatus")?.addEventListener("change", (e) => {
      this.tripFilters.status = e.target.value;
      this.renderer.renderDispatches(this.state.dispatches || [], this.tripFilters);
    });

    document.getElementById("trpFilterTripVehicle")?.addEventListener("change", (e) => {
      this.tripFilters.vehicleId = e.target.value;
      this.renderer.renderDispatches(this.state.dispatches || [], this.tripFilters);
    });

    document.getElementById("trpFilterTripDate")?.addEventListener("change", (e) => {
      this.tripFilters.date = e.target.value;
      this.renderer.renderDispatches(this.state.dispatches || [], this.tripFilters);
    });

    document.getElementById("btnResetTripFilters")?.addEventListener("click", () => {
      this.tripFilters = { search: "", status: "ALL", vehicleId: "ALL", date: "" };
      const s = document.getElementById("trpSearchDispatches");
      const st = document.getElementById("trpFilterTripStatus");
      const vh = document.getElementById("trpFilterTripVehicle");
      const dt = document.getElementById("trpFilterTripDate");
      if (s) s.value = "";
      if (st) st.value = "ALL";
      if (vh) vh.value = "ALL";
      if (dt) dt.value = "";
      this.renderer.renderDispatches(this.state.dispatches || [], this.tripFilters);
    });

    document.getElementById("trpSearchVehicles")?.addEventListener("input", (e) => {
      this.vehicleFilters.search = e.target.value;
      this.renderer.renderVehicles(this.state.vehicles || [], this.vehicleFilters);
    });

    document.getElementById("trpFilterVehicleStatus")?.addEventListener("change", (e) => {
      this.vehicleFilters.status = e.target.value;
      this.renderer.renderVehicles(this.state.vehicles || [], this.vehicleFilters);
    });

    document.getElementById("trpSearchDrivers")?.addEventListener("input", (e) => {
      this.driverSearch = e.target.value;
      this.renderer.renderDrivers(this.state.drivers || [], this.driverSearch);
    });
  }

  bindTableActions() {
    this.root.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      const tripId = Number(btn.getAttribute("data-trip-id") || 0);
      const vehicleId = Number(btn.getAttribute("data-vehicle-id") || 0);

      if (action === "complete-trip" && tripId) {
        const trip = (this.state.dispatches || []).find((t) => Number(t.id) === tripId);
        if (trip) this.modals.openCompleteTripModal(trip);
      } else if (action === "change-trip-driver" && tripId) {
        const trip = (this.state.dispatches || []).find((t) => Number(t.id) === tripId);
        if (trip) this.modals.openAssignDriverModal({ mode: "trip", trip });
      } else if (action === "delete-trip" && tripId) {
        const trip = (this.state.dispatches || []).find((t) => Number(t.id) === tripId);
        const confirmed = await ConfirmModalHelper.confirm({
          title: "Delete Transport Trip",
          message: `Are you sure you want to delete ${trip?.trip_code || "this transport trip"}?`,
          confirmText: "Yes, Delete",
          type: "danger",
        });
        if (!confirmed) return;
        try {
          const res = await this.dataService.deleteTrip(tripId);
          this.showToast(res?.message || "Transport trip deleted.");
          await this.refreshData();
        } catch (err) {
          this.showToast(err?.message || "Failed to delete trip.", "error");
        }
      } else if (action === "assign-vehicle-driver" && vehicleId) {
        const vehicle = (this.state.vehicles || []).find((v) => Number(v.id) === vehicleId);
        if (vehicle) this.modals.openAssignDriverModal({ mode: "vehicle", vehicle });
      } else if (action === "dispatch-this-vehicle" && vehicleId) {
        this.modals.openStartDispatchModal(vehicleId);
      } else if (action === "edit-vehicle" && vehicleId) {
        const vehicle = (this.state.vehicles || []).find((v) => Number(v.id) === vehicleId);
        if (vehicle) this.modals.openVehicleModal(vehicle);
      } else if (action === "delete-vehicle" && vehicleId) {
        const vehicle = (this.state.vehicles || []).find((v) => Number(v.id) === vehicleId);
        const confirmed = await ConfirmModalHelper.confirm({
          title: "Remove Vehicle",
          message: `Remove vehicle ${vehicle?.register || ""} from the fleet?`,
          confirmText: "Remove Vehicle",
          type: "danger",
        });
        if (!confirmed) return;
        try {
          const res = await this.dataService.deleteVehicle(vehicleId);
          this.showToast(res?.message || "Vehicle removed.");
          await this.refreshData();
        } catch (err) {
          this.showToast(err?.message || "Failed to remove vehicle.", "error");
        }
      }
    });
  }

  showToast(message, type = "success") {
    const toast = document.getElementById("trpToast");
    const msgEl = document.getElementById("trpToastMsg");
    const iconEl = document.getElementById("trpToastIcon");
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    if (iconEl) {
      if (type === "error") {
        iconEl.className = "fa-solid fa-circle-exclamation";
        iconEl.style.color = "#ef4444";
      } else if (type === "warning") {
        iconEl.className = "fa-solid fa-triangle-exclamation";
        iconEl.style.color = "#f59e0b";
      } else {
        iconEl.className = "fa-solid fa-circle-check";
        iconEl.style.color = "#10b981";
      }
    }

    toast.classList.add("show");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3400);
  }
}

if (typeof window !== "undefined") {
  window.TransportManager = TransportManager;

  const bootTransport = () => {
    const container = document.getElementById("module-transport");
    if (container && container.dataset.transportBooted !== "1") {
      container.dataset.transportBooted = "1";
      window.transportManager = new TransportManager();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootTransport);
  } else {
    bootTransport();
  }

  document.addEventListener("turbo:load", bootTransport);
}

export default TransportManager;
