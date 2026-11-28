/**
 * SanjeewaAdvertising - Admin Transport Modals Controller
 *
 * Handles Vehicle Add/Edit, Driver Assignment, Start Dispatch, Complete & Diesel Log,
 * Diesel Rate Update, and Quick Driver Registration modals.
 */

"use strict";

export class TransportModalsController {
  constructor({ getState, dataService, onMutated, showToast }) {
    this.getState = getState;
    this.dataService = dataService;
    this.onMutated = onMutated;
    this.showToast = showToast;
    this.costManuallyEdited = false;

    this.bindEvents();
  }

  escapeHtml(val) {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  nowLocalDatetime() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  todayDateString() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  openModal(id) {
    document.getElementById(id)?.classList.add("open");
  }

  closeModal(id) {
    document.getElementById(id)?.classList.remove("open");
  }

  closeAll() {
    document.querySelectorAll(".trp-modal-overlay.open").forEach((el) => el.classList.remove("open"));
  }

  showError(elId, err) {
    const box = document.getElementById(elId);
    if (!box) return;
    let msg = err?.message || "Please check your inputs and try again.";
    if (err?.errors && typeof err.errors === "object") {
      const firstKey = Object.keys(err.errors)[0];
      if (firstKey && Array.isArray(err.errors[firstKey]) && err.errors[firstKey][0]) {
        msg = err.errors[firstKey][0];
      }
    }
    box.textContent = msg;
    box.style.display = "block";
  }

  clearError(elId) {
    const box = document.getElementById(elId);
    if (box) {
      box.textContent = "";
      box.style.display = "none";
    }
  }

  buildStaffOptionsHtml(selectedId = null, allowEmptyLabel = "-- Choose Driver --") {
    const state = this.getState();
    const staffList = Array.isArray(state.all_staff) && state.all_staff.length > 0
      ? state.all_staff
      : state.drivers || [];

    const sorted = [...staffList].sort((a, b) => {
      if (a.is_driver_role !== b.is_driver_role) return a.is_driver_role ? -1 : 1;
      return String(a.full_name || "").localeCompare(String(b.full_name || ""));
    });

    return (
      `<option value="">${this.escapeHtml(allowEmptyLabel)}</option>` +
      sorted
        .map((s) => {
          const tripTag = s.is_on_trip ? ` [On Trip: ${s.active_trip_truck || "Active"}]` : "";
          const roleTag = s.staff_type ? ` (${s.staff_type})` : "";
          const sel = selectedId && Number(selectedId) === Number(s.id) ? "selected" : "";
          return `<option value="${s.id}" ${sel}>${this.escapeHtml(s.full_name)}${this.escapeHtml(roleTag)}${this.escapeHtml(tripTag)}</option>`;
        })
        .join("")
    );
  }

  buildDieselOptionsHtml(selectedId = null) {
    const state = this.getState();
    const prices = state.diesel_prices || [];
    if (prices.length === 0) {
      const fallback = state.kpi?.current_diesel_rate || 286;
      return `<option value="" data-rate="${fallback}">Rs. ${Number(fallback).toFixed(2)} / L (Default)</option>`;
    }

    return prices
      .map((dp, idx) => {
        const sel = selectedId
          ? Number(selectedId) === Number(dp.id)
          : idx === 0;
        return `<option value="${dp.id}" data-rate="${dp.price}" ${sel ? "selected" : ""}>Rs. ${Number(dp.price).toFixed(2)} / L (${this.escapeHtml(dp.date_formatted)}${idx === 0 ? " - Current" : ""})</option>`;
      })
      .join("");
  }

  bindEvents() {
    // Close modal buttons & overlay clicks
    document.querySelectorAll("[data-close-trp-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.closeModal(btn.getAttribute("data-close-trp-modal"));
      });
    });

    document.querySelectorAll(".trp-modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("open");
      });
    });

    // Toggle inline new vehicle model input
    document.getElementById("btnToggleNewModelInput")?.addEventListener("click", () => {
      const wrap = document.getElementById("trpNewModelWrap");
      const input = document.getElementById("trpNewModelName");
      if (!wrap) return;
      const isHidden = wrap.style.display === "none";
      wrap.style.display = isHidden ? "block" : "none";
      if (isHidden) {
        input?.focus();
      } else if (input) {
        input.value = "";
      }
    });

    // Quick "+ New Driver" links from Assign Driver & Start Dispatch modals
    document.getElementById("btnQuickNewDriverFromAssign")?.addEventListener("click", () => {
      this.closeModal("modalTrpAssignDriver");
      this.openAddDriverModal();
    });
    document.getElementById("btnQuickNewDriverFromDispatch")?.addEventListener("click", () => {
      this.closeModal("modalTrpStartDispatch");
      this.openAddDriverModal();
    });

    // Auto-fill driver & starting odometer when choosing a vehicle in Start Dispatch modal
    document.getElementById("trpDispatchVehicleSelect")?.addEventListener("change", (e) => {
      const vehicleId = Number(e.target.value);
      const state = this.getState();
      const vehicle = (state.vehicles || []).find((v) => Number(v.id) === vehicleId);
      if (!vehicle) return;

      const startKmInput = document.getElementById("trpDispatchStartKm");
      if (startKmInput) {
        startKmInput.value = String(vehicle.current_km || 0);
      }

      const driverSelect = document.getElementById("trpDispatchDriverSelect");
      if (driverSelect && vehicle.default_staff_id) {
        driverSelect.value = String(vehicle.default_staff_id);
      }
    });

    // Live distance, fuel efficiency & diesel cost calculator in Complete Trip modal
    const recalcCompletion = () => this.recalculateCompletionSummary();
    document.getElementById("trpCompleteEndKm")?.addEventListener("input", recalcCompletion);
    document.getElementById("trpCompleteDieselLiters")?.addEventListener("input", () => {
      this.costManuallyEdited = false;
      this.recalculateCompletionSummary();
    });
    document.getElementById("trpCompleteDieselRateSelect")?.addEventListener("change", () => {
      this.costManuallyEdited = false;
      this.recalculateCompletionSummary();
    });
    document.getElementById("trpCompleteDieselCostOverride")?.addEventListener("input", () => {
      this.costManuallyEdited = true;
    });

    // Smart Auto-Estimate Diesel Liters button
    document.getElementById("btnEstimateDieselLiters")?.addEventListener("click", () => {
      const startKm = parseInt(document.getElementById("completeTripStartKm")?.value || "0", 10);
      const endKm = parseInt(document.getElementById("trpCompleteEndKm")?.value || "0", 10);
      const distance = Math.max(0, endKm - startKm);
      if (distance <= 0) {
        this.showToast("Enter a closing odometer greater than starting km first.", "warning");
        return;
      }
      const eff = parseFloat(document.getElementById("completeTripExpectedEff")?.value || "0") || 9.0;
      const estimatedLiters = Number((distance / eff).toFixed(3));
      const litersInput = document.getElementById("trpCompleteDieselLiters");
      if (litersInput) {
        litersInput.value = String(estimatedLiters);
        this.costManuallyEdited = false;
        this.recalculateCompletionSummary();
      }
    });

    // Form Submissions
    document.getElementById("formTrpVehicle")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitVehicleForm();
    });

    document.getElementById("formTrpAssignDriver")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitAssignDriverForm();
    });

    document.getElementById("formTrpStartDispatch")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitStartDispatchForm();
    });

    document.getElementById("formTrpCompleteTrip")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitCompleteTripForm();
    });

    document.getElementById("formTrpDieselPrice")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitDieselPriceForm();
    });

    document.getElementById("formTrpAddDriver")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitAddDriverForm();
    });
  }

  // 1. Add / Edit Vehicle Modal
  openVehicleModal(vehicle = null) {
    this.clearError("trpVehicleError");
    const state = this.getState();

    const titleEl = document.getElementById("modalTrpVehicleTitle");
    const submitLabel = document.getElementById("btnSubmitTrpVehicleLabel");
    const idInput = document.getElementById("trpVehicleId");
    const regInput = document.getElementById("trpVehicleRegister");
    const statusSelect = document.getElementById("trpVehicleStatus");
    const modelSelect = document.getElementById("trpVehicleModelSelect");
    const newModelWrap = document.getElementById("trpNewModelWrap");
    const newModelInput = document.getElementById("trpNewModelName");
    const driverSelect = document.getElementById("trpVehicleDriverSelect");
    const kmInput = document.getElementById("trpVehicleCurrentKm");
    const effInput = document.getElementById("trpVehicleEfficiency");

    if (newModelWrap) newModelWrap.style.display = "none";
    if (newModelInput) newModelInput.value = "";

    if (modelSelect) {
      modelSelect.innerHTML =
        '<option value="">-- Select Vehicle Model --</option>' +
        (state.models || [])
          .map(
            (m) =>
              `<option value="${m.id}" ${vehicle && Number(vehicle.model_id) === Number(m.id) ? "selected" : ""}>${this.escapeHtml(m.name)}</option>`
          )
          .join("");
    }

    if (driverSelect) {
      driverSelect.innerHTML = this.buildStaffOptionsHtml(
        vehicle?.default_staff_id || null,
        "-- No Default Driver Assigned --"
      );
    }

    if (vehicle) {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #1677ff;"></i> Edit Vehicle — ${this.escapeHtml(vehicle.register)}`;
      if (submitLabel) submitLabel.textContent = "Update Vehicle";
      if (idInput) idInput.value = String(vehicle.id);
      if (regInput) regInput.value = vehicle.register || "";
      if (statusSelect) statusSelect.value = vehicle.status === "Maintenance" ? "Maintenance" : "Available";
      if (kmInput) kmInput.value = String(vehicle.current_km || 0);
      if (effInput) effInput.value = vehicle.fuel_efficiency ? String(vehicle.fuel_efficiency) : "";
    } else {
      if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-truck-medical" style="color: #1677ff;"></i> Add Fleet Vehicle';
      if (submitLabel) submitLabel.textContent = "Save Vehicle";
      if (idInput) idInput.value = "";
      if (regInput) regInput.value = "";
      if (statusSelect) statusSelect.value = "Available";
      if (kmInput) kmInput.value = "0";
      if (effInput) effInput.value = "";
    }

    this.openModal("modalTrpVehicle");
  }

  async submitVehicleForm() {
    this.clearError("trpVehicleError");
    const id = document.getElementById("trpVehicleId")?.value;
    const newModelName = document.getElementById("trpNewModelName")?.value.trim() || "";
    const modelId = document.getElementById("trpVehicleModelSelect")?.value || "";

    if (!modelId && !newModelName) {
      this.showError("trpVehicleError", { message: "Please select a vehicle model or enter a new model name." });
      return;
    }

    const payload = {
      register: document.getElementById("trpVehicleRegister")?.value.trim().toUpperCase(),
      model_id: modelId ? Number(modelId) : null,
      new_model_name: newModelName || null,
      default_staff_id: document.getElementById("trpVehicleDriverSelect")?.value
        ? Number(document.getElementById("trpVehicleDriverSelect").value)
        : null,
      current_km: parseInt(document.getElementById("trpVehicleCurrentKm")?.value || "0", 10) || 0,
      fuel_efficiency: document.getElementById("trpVehicleEfficiency")?.value
        ? parseFloat(document.getElementById("trpVehicleEfficiency").value)
        : null,
      status: document.getElementById("trpVehicleStatus")?.value || "Available",
    };

    const btn = document.getElementById("btnSubmitTrpVehicle");
    if (btn) btn.disabled = true;

    try {
      const res = id
        ? await this.dataService.updateVehicle(Number(id), payload)
        : await this.dataService.createVehicle(payload);
      this.closeModal("modalTrpVehicle");
      this.showToast(res?.message || "Vehicle saved successfully.");
      await this.onMutated();
    } catch (err) {
      this.showError("trpVehicleError", err);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // 2. Assign Driver Modal (for Vehicle or Active Trip)
  openAssignDriverModal({ mode = "vehicle", vehicle = null, trip = null }) {
    this.clearError("trpAssignDriverError");

    const modeInput = document.getElementById("assignDriverMode");
    const targetInput = document.getElementById("assignDriverTargetId");
    const titleEl = document.getElementById("modalAssignDriverTitle");
    const summaryEl = document.getElementById("assignDriverVehicleSummary");
    const selectEl = document.getElementById("trpAssignDriverSelect");
    const activeWrap = document.getElementById("assignDriverActiveTripWrap");

    if (mode === "trip" && trip) {
      if (modeInput) modeInput.value = "trip";
      if (targetInput) targetInput.value = String(trip.id);
      if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-user-pen" style="color: #0284c7;"></i> Change Driver on Active Trip';
      if (summaryEl) {
        summaryEl.innerHTML = `<strong>${this.escapeHtml(trip.trip_code)}</strong> • Vehicle: <strong>${this.escapeHtml(trip.truck_register)}</strong> (${this.escapeHtml(trip.truck_model)})<br><span style="color: var(--text-muted);">Route: ${this.escapeHtml(trip.destination || "Active Delivery")}</span>`;
      }
      if (selectEl) {
        selectEl.innerHTML = this.buildStaffOptionsHtml(trip.staff_id, "-- Select Driver --");
      }
      if (activeWrap) activeWrap.style.display = "none";
    } else if (vehicle) {
      if (modeInput) modeInput.value = "vehicle";
      if (targetInput) targetInput.value = String(vehicle.id);
      if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-id-badge" style="color: #0284c7;"></i> Assign Default Driver to Vehicle';
      if (summaryEl) {
        summaryEl.innerHTML = `Vehicle: <strong>${this.escapeHtml(vehicle.register)}</strong> • ${this.escapeHtml(vehicle.model_name)}<br><span style="color: var(--text-muted);">Current Odometer: ${Number(vehicle.current_km || 0).toLocaleString()} km</span>`;
      }
      if (selectEl) {
        selectEl.innerHTML = this.buildStaffOptionsHtml(
          vehicle.default_staff_id,
          "-- Unassigned (No Default Driver) --"
        );
      }
      if (activeWrap) {
        activeWrap.style.display = vehicle.active_trip_id ? "flex" : "none";
      }
    }

    this.openModal("modalTrpAssignDriver");
  }

  async submitAssignDriverForm() {
    this.clearError("trpAssignDriverError");
    const mode = document.getElementById("assignDriverMode")?.value;
    const targetId = Number(document.getElementById("assignDriverTargetId")?.value);
    const staffVal = document.getElementById("trpAssignDriverSelect")?.value;
    const staffId = staffVal ? Number(staffVal) : null;
    const btn = document.getElementById("btnSubmitAssignDriver");

    if (mode === "trip" && !staffId) {
      this.showError("trpAssignDriverError", { message: "Please select a driver for this active transport trip." });
      return;
    }

    if (btn) btn.disabled = true;
    try {
      let res;
      if (mode === "trip") {
        res = await this.dataService.assignTripDriver(targetId, staffId);
      } else {
        const applyActive = Boolean(document.getElementById("chkApplyDriverToActiveTrip")?.checked);
        res = await this.dataService.assignVehicleDriver(targetId, {
          staff_id: staffId,
          apply_to_active_trip: applyActive,
        });
      }
      this.closeModal("modalTrpAssignDriver");
      this.showToast(res?.message || "Driver assignment updated.");
      await this.onMutated();
    } catch (err) {
      this.showError("trpAssignDriverError", err);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // 3. Start New Dispatch Modal
  openStartDispatchModal(preselectedVehicleId = null) {
    this.clearError("trpStartDispatchError");
    const state = this.getState();

    const availableVehicles = (state.vehicles || []).filter((v) => v.status === "Available");
    const vehSelect = document.getElementById("trpDispatchVehicleSelect");
    const drvSelect = document.getElementById("trpDispatchDriverSelect");
    const jobSelect = document.getElementById("trpDispatchPrintJobSelect");
    const dslSelect = document.getElementById("trpDispatchDieselRateSelect");
    const startTime = document.getElementById("trpDispatchStartTime");
    const startKm = document.getElementById("trpDispatchStartKm");
    const destInput = document.getElementById("trpDispatchDestination");
    const notesInput = document.getElementById("trpDispatchNotes");

    if (vehSelect) {
      vehSelect.innerHTML =
        '<option value="">-- Choose Available Vehicle --</option>' +
        availableVehicles
          .map(
            (v) =>
              `<option value="${v.id}" ${preselectedVehicleId && Number(preselectedVehicleId) === Number(v.id) ? "selected" : ""}>${this.escapeHtml(v.register)} — ${this.escapeHtml(v.model_name)} (${Number(v.current_km || 0).toLocaleString()} km)</option>`
          )
          .join("");
    }

    if (drvSelect) {
      drvSelect.innerHTML = this.buildStaffOptionsHtml(null, "-- Choose Driver --");
    }

    if (jobSelect) {
      jobSelect.innerHTML =
        '<option value="">-- General / Multi-Order Trip --</option>' +
        (state.deliverable_jobs || [])
          .map((j) => `<option value="${j.id}">${this.escapeHtml(j.label)}</option>`)
          .join("");
    }

    if (dslSelect) {
      dslSelect.innerHTML = this.buildDieselOptionsHtml(state.kpi?.current_diesel_id);
    }

    if (startTime) startTime.value = this.nowLocalDatetime();
    if (destInput) destInput.value = "";
    if (notesInput) notesInput.value = "";
    if (startKm) startKm.value = "0";

    const chosenId = preselectedVehicleId || (availableVehicles[0]?.id ?? null);
    if (chosenId && vehSelect) {
      vehSelect.value = String(chosenId);
      vehSelect.dispatchEvent(new Event("change"));
    }

    this.openModal("modalTrpStartDispatch");
  }

  async submitStartDispatchForm() {
    this.clearError("trpStartDispatchError");
    const btn = document.getElementById("btnSubmitStartDispatch");

    const payload = {
      truck_id: Number(document.getElementById("trpDispatchVehicleSelect")?.value || 0),
      staff_id: Number(document.getElementById("trpDispatchDriverSelect")?.value || 0),
      destination: document.getElementById("trpDispatchDestination")?.value.trim() || "",
      start: document.getElementById("trpDispatchStartTime")?.value || null,
      start_km: parseInt(document.getElementById("trpDispatchStartKm")?.value || "0", 10) || 0,
      print_jobs_id: document.getElementById("trpDispatchPrintJobSelect")?.value
        ? Number(document.getElementById("trpDispatchPrintJobSelect").value)
        : null,
      desial_price_id: document.getElementById("trpDispatchDieselRateSelect")?.value
        ? Number(document.getElementById("trpDispatchDieselRateSelect").value)
        : null,
      notes: document.getElementById("trpDispatchNotes")?.value.trim() || null,
    };

    if (!payload.truck_id) {
      this.showError("trpStartDispatchError", { message: "Please select an available vehicle to dispatch." });
      return;
    }
    if (!payload.staff_id) {
      this.showError("trpStartDispatchError", { message: "Please assign a driver for this transport trip." });
      return;
    }

    if (btn) btn.disabled = true;
    try {
      const res = await this.dataService.startDispatch(payload);
      this.closeModal("modalTrpStartDispatch");
      this.showToast(res?.message || "Vehicle dispatched successfully.");
      await this.onMutated();
    } catch (err) {
      this.showError("trpStartDispatchError", err);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // 4. Complete Transport & Log Diesel Modal
  openCompleteTripModal(trip) {
    if (!trip) return;
    this.clearError("trpCompleteTripError");
    this.costManuallyEdited = false;

    document.getElementById("completeTripId").value = String(trip.id);
    document.getElementById("completeTripStartKm").value = String(trip.start_km || 0);
    document.getElementById("completeTripExpectedEff").value = trip.truck_efficiency ? String(trip.truck_efficiency) : "";

    const banner = document.getElementById("completeTripSummaryBanner");
    if (banner) {
      banner.innerHTML = `
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div>
            <strong>${this.escapeHtml(trip.trip_code)}</strong> •
            <span class="trp-plate-badge">${this.escapeHtml(trip.truck_register)}</span>
            <span style="margin-left: 6px; font-weight: 600;">Driver: ${this.escapeHtml(trip.driver_name)}</span>
          </div>
          <div>
            Start Meter: <strong style="font-family: monospace;">${Number(trip.start_km).toLocaleString()} km</strong>
          </div>
        </div>
      `;
    }

    const endTime = document.getElementById("trpCompleteEndTime");
    const endKm = document.getElementById("trpCompleteEndKm");
    const litersInput = document.getElementById("trpCompleteDieselLiters");
    const dslSelect = document.getElementById("trpCompleteDieselRateSelect");
    const costInput = document.getElementById("trpCompleteDieselCostOverride");
    const destInput = document.getElementById("trpCompleteDestination");
    const notesInput = document.getElementById("trpCompleteNotes");

    if (dslSelect) {
      dslSelect.innerHTML = this.buildDieselOptionsHtml(trip.desial_price_id);
    }

    if (endTime) endTime.value = trip.end || this.nowLocalDatetime();
    if (endKm) {
      endKm.min = String(trip.start_km || 0);
      endKm.value = trip.end_km !== null && trip.end_km !== undefined ? String(trip.end_km) : "";
    }
    if (litersInput) {
      litersInput.value = trip.diesel_liters !== null && trip.diesel_liters !== undefined ? String(trip.diesel_liters) : "";
    }
    if (costInput) {
      costInput.value = trip.diesel_cost !== null && trip.diesel_cost !== undefined ? String(trip.diesel_cost) : "";
    }
    if (destInput) destInput.value = trip.destination || "";
    if (notesInput) notesInput.value = trip.notes || "";

    this.recalculateCompletionSummary();
    this.openModal("modalTrpCompleteTrip");
  }

  recalculateCompletionSummary() {
    const startKm = parseInt(document.getElementById("completeTripStartKm")?.value || "0", 10);
    const endKmRaw = parseInt(document.getElementById("trpCompleteEndKm")?.value || "", 10);
    const liters = parseFloat(document.getElementById("trpCompleteDieselLiters")?.value || "0") || 0;

    const rateSelect = document.getElementById("trpCompleteDieselRateSelect");
    const selectedOpt = rateSelect?.selectedOptions?.[0];
    const rate = parseFloat(selectedOpt?.getAttribute("data-rate") || "286") || 286;

    const distance = !isNaN(endKmRaw) && endKmRaw >= startKm ? endKmRaw - startKm : 0;
    const autoCost = Number((liters * rate).toFixed(2));
    const economy = distance > 0 && liters > 0 ? (distance / liters).toFixed(2) : null;

    const distEl = document.getElementById("calcTripDistanceKm");
    const ecoEl = document.getElementById("calcTripFuelEconomy");
    const costEl = document.getElementById("calcTripDieselCost");
    const costInput = document.getElementById("trpCompleteDieselCostOverride");

    if (distEl) distEl.textContent = `${distance.toLocaleString()} km`;
    if (ecoEl) ecoEl.textContent = economy ? `${economy} km/L` : "— km/L";
    if (costEl) {
      costEl.textContent = `Rs. ${autoCost.toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    if (costInput && !this.costManuallyEdited && liters > 0) {
      costInput.value = autoCost.toFixed(2);
    }
  }

  async submitCompleteTripForm() {
    this.clearError("trpCompleteTripError");
    const tripId = Number(document.getElementById("completeTripId")?.value);
    const startKm = parseInt(document.getElementById("completeTripStartKm")?.value || "0", 10);
    const endKm = parseInt(document.getElementById("trpCompleteEndKm")?.value || "-1", 10);
    const dieselLiters = parseFloat(document.getElementById("trpCompleteDieselLiters")?.value || "-1");

    if (isNaN(endKm) || endKm < startKm) {
      this.showError("trpCompleteTripError", {
        message: `Closing odometer must be at least ${startKm} km.`,
      });
      return;
    }

    if (isNaN(dieselLiters) || dieselLiters < 0) {
      this.showError("trpCompleteTripError", {
        message: "Please enter the diesel consumed in Liters.",
      });
      return;
    }

    const costVal = document.getElementById("trpCompleteDieselCostOverride")?.value;
    const payload = {
      end: document.getElementById("trpCompleteEndTime")?.value || null,
      end_km: endKm,
      diesel_liters: Number(dieselLiters.toFixed(3)),
      diesel_cost: costVal !== "" && costVal !== undefined ? Number(parseFloat(costVal).toFixed(2)) : null,
      desial_price_id: document.getElementById("trpCompleteDieselRateSelect")?.value
        ? Number(document.getElementById("trpCompleteDieselRateSelect").value)
        : null,
      destination: document.getElementById("trpCompleteDestination")?.value.trim() || null,
      notes: document.getElementById("trpCompleteNotes")?.value.trim() || null,
    };

    const btn = document.getElementById("btnSubmitCompleteTrip");
    if (btn) btn.disabled = true;

    try {
      const res = await this.dataService.completeTrip(tripId, payload);
      this.closeModal("modalTrpCompleteTrip");
      this.showToast(res?.message || "Transport trip completed and diesel recorded.");
      await this.onMutated();
    } catch (err) {
      this.showError("trpCompleteTripError", err);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // 5. Update Diesel Price Modal
  openDieselPriceModal() {
    this.clearError("trpDieselPriceError");
    const state = this.getState();
    const priceInput = document.getElementById("trpDieselPriceInput");
    const dateInput = document.getElementById("trpDieselDateInput");

    if (priceInput) priceInput.value = String(state.kpi?.current_diesel_rate || 286);
    if (dateInput) dateInput.value = this.todayDateString();

    this.openModal("modalTrpDieselPrice");
  }

  async submitDieselPriceForm() {
    this.clearError("trpDieselPriceError");
    const btn = document.getElementById("btnSubmitDieselPrice");

    const payload = {
      price: parseFloat(document.getElementById("trpDieselPriceInput")?.value || "0"),
      add_date: document.getElementById("trpDieselDateInput")?.value || null,
    };

    if (btn) btn.disabled = true;
    try {
      const res = await this.dataService.addDieselPrice(payload);
      this.closeModal("modalTrpDieselPrice");
      this.showToast(res?.message || "Diesel rate updated.");
      await this.onMutated();
    } catch (err) {
      this.showError("trpDieselPriceError", err);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // 6. Quick Register Driver Modal
  openAddDriverModal() {
    this.clearError("trpAddDriverError");
    const state = this.getState();

    document.getElementById("trpDriverFirstName").value = "";
    document.getElementById("trpDriverLastName").value = "";
    document.getElementById("trpDriverNic").value = "";
    document.getElementById("trpDriverMobile").value = "";
    document.getElementById("trpDriverRole").value = "Driver";

    const vehSelect = document.getElementById("trpDriverAssignVehicle");
    if (vehSelect) {
      vehSelect.innerHTML =
        '<option value="">-- Do Not Assign Yet --</option>' +
        (state.vehicles || [])
          .map(
            (v) =>
              `<option value="${v.id}">${this.escapeHtml(v.register)} (${this.escapeHtml(v.model_name)})</option>`
          )
          .join("");
    }

    this.openModal("modalTrpAddDriver");
  }

  async submitAddDriverForm() {
    this.clearError("trpAddDriverError");
    const btn = document.getElementById("btnSubmitAddDriver");

    const payload = {
      first_name: document.getElementById("trpDriverFirstName")?.value.trim(),
      last_name: document.getElementById("trpDriverLastName")?.value.trim(),
      nic: document.getElementById("trpDriverNic")?.value.trim(),
      mobile: document.getElementById("trpDriverMobile")?.value.trim(),
      role: document.getElementById("trpDriverRole")?.value || "Driver",
      assign_truck_id: document.getElementById("trpDriverAssignVehicle")?.value
        ? Number(document.getElementById("trpDriverAssignVehicle").value)
        : null,
    };

    if (btn) btn.disabled = true;
    try {
      const res = await this.dataService.registerDriver(payload);
      this.closeModal("modalTrpAddDriver");
      this.showToast(res?.message || "Driver registered successfully.");
      await this.onMutated();
    } catch (err) {
      this.showError("trpAddDriverError", err);
    } finally {
      if (btn) btn.disabled = false;
    }
  }
}

export default TransportModalsController;
