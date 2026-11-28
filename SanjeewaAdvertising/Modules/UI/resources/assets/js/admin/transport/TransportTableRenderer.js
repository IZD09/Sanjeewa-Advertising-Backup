/**
 * SanjeewaAdvertising - Admin Transport Table & KPI Renderer
 *
 * Renders KPI summary cards and the 4 Transport tabs (Dispatches, Vehicles, Drivers, Diesel History).
 */

"use strict";

export class TransportTableRenderer {
  escapeHtml(val) {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  formatQty(num) {
    const n = parseFloat(num);
    if (isNaN(n)) return "0";
    return String(Number(n.toFixed(3)));
  }

  formatCurrency(amount) {
    const n = parseFloat(amount) || 0;
    return `Rs. ${n.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  renderKpis(kpi = {}) {
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText("kpiTotalDispatches", String(kpi.total_dispatches ?? 0));
    setText(
      "kpiTotalDistanceDesc",
      `${Number(kpi.total_distance_km || 0).toLocaleString()} km logged`
    );
    setText("kpiInTransit", String(kpi.in_transit ?? 0));
    setText("kpiDeliveredToday", String(kpi.delivered_today ?? 0));
    setText(
      "kpiTodayDieselDesc",
      `${this.formatQty(kpi.today_diesel_liters || 0)} L today`
    );
    setText("kpiActiveVehicles", String(kpi.active_vehicles ?? 0));
    setText(
      "kpiAvailableVehiclesDesc",
      `${kpi.available_vehicles ?? 0} Ready • ${kpi.drivers_count ?? 0} Drivers`
    );
    setText("kpiTotalDieselCost", this.formatCurrency(kpi.total_diesel_cost || 0));
    setText(
      "kpiTotalDieselLitersDesc",
      `${this.formatQty(kpi.total_diesel_liters || 0)} L Consumed`
    );

    const rateEl = document.getElementById("trpHeaderDieselRate");
    if (rateEl) {
      rateEl.textContent = this.formatCurrency(kpi.current_diesel_rate || 286);
    }
  }

  renderTabBadges(state) {
    const setBadge = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(count);
    };

    setBadge("badgeTrpDispatches", (state.dispatches || []).length);
    setBadge("badgeTrpVehicles", (state.vehicles || []).length);
    setBadge("badgeTrpDrivers", (state.drivers || []).length);
    setBadge("badgeTrpDiesel", (state.diesel_prices || []).length);
  }

  populateVehicleFilterDropdown(vehicles = []) {
    const sel = document.getElementById("trpFilterTripVehicle");
    if (!sel) return;

    const current = sel.value || "ALL";
    sel.innerHTML =
      '<option value="ALL">All Vehicles</option>' +
      vehicles
        .map(
          (v) =>
            `<option value="${v.id}" ${String(v.id) === String(current) ? "selected" : ""}>${this.escapeHtml(v.register)} (${this.escapeHtml(v.model_name)})</option>`
        )
        .join("");
  }

  renderDispatches(dispatches = [], filters = {}) {
    const tbody = document.getElementById("trpDispatchesTbody");
    if (!tbody) return;

    const q = (filters.search || "").trim().toLowerCase();
    const statusFilter = filters.status || "ALL";
    const vehicleFilter = filters.vehicleId || "ALL";
    const dateFilter = filters.date || "";

    const rows = dispatches.filter((d) => {
      if (statusFilter !== "ALL" && d.status !== statusFilter) return false;
      if (vehicleFilter !== "ALL" && String(d.truck_id) !== String(vehicleFilter)) return false;
      if (dateFilter && d.start_date !== dateFilter) return false;
      if (q) {
        const hay = `${d.trip_code} ${d.truck_register} ${d.truck_model} ${d.driver_name} ${d.destination} ${d.print_job_code || ""} ${d.print_job_customer || ""} ${d.notes || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (rows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="trp-empty-row">
            <i class="fa-solid fa-truck-ramp-box" style="font-size: 22px; display: block; margin-bottom: 8px; color: #1677ff; opacity: 0.65;"></i>
            No transport dispatches match the current filters. Click <strong>"Start Transport"</strong> to dispatch a vehicle.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = rows
      .map((d) => {
        const isTransit = !d.is_completed;
        const jobTag = d.print_job_code
          ? `<div class="trp-job-pill"><i class="fa-solid fa-print"></i> ${this.escapeHtml(d.print_job_code)}${d.print_job_customer ? " • " + this.escapeHtml(d.print_job_customer) : ""}</div>`
          : "";
        const notesSub = d.notes
          ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${this.escapeHtml(d.notes)}</div>`
          : "";

        const odoHtml = d.is_completed
          ? `<div style="font-family: monospace; font-size: 12px;">${Number(d.start_km).toLocaleString()} &rarr; <strong>${Number(d.end_km).toLocaleString()} km</strong></div>
             <div style="font-size: 11.5px; font-weight: 700; color: #1677ff;">${Number(d.distance_km).toLocaleString()} km trip</div>`
          : `<div style="font-family: monospace; font-size: 12px;">Start: <strong>${Number(d.start_km).toLocaleString()} km</strong></div>
             <div style="font-size: 11px; color: #d97706;">Awaiting return reading</div>`;

        const dieselHtml = d.is_completed
          ? `<div><strong>${this.formatQty(d.diesel_liters || 0)} L</strong> <span style="font-size: 11px; color: var(--text-muted);">@ Rs. ${Number(d.diesel_rate || 0).toFixed(2)}</span></div>
             <div style="font-weight: 800; color: #059669;">${this.formatCurrency(d.diesel_cost || 0)}</div>
             ${d.actual_km_per_liter ? `<span class="trp-eff-pill">${d.actual_km_per_liter} km/L</span>` : ""}`
          : `<span style="font-size: 11.5px; color: var(--text-muted); font-style: italic;">Log on completion</span>`;

        const statusBadge = isTransit
          ? `<span class="trp-status-pill transit"><i class="fa-solid fa-spinner fa-spin"></i> In Transit</span>`
          : `<span class="trp-status-pill completed"><i class="fa-solid fa-circle-check"></i> Completed</span>`;

        const primaryAction = isTransit
          ? `<button type="button" class="trp-btn-complete" data-action="complete-trip" data-trip-id="${d.id}" title="Complete transport and record diesel used">
               <i class="fa-solid fa-gas-pump"></i> Complete &amp; Diesel
             </button>
             <button type="button" class="trp-btn-icon" data-action="change-trip-driver" data-trip-id="${d.id}" title="Change driver on this vehicle">
               <i class="fa-solid fa-user-pen"></i>
             </button>`
          : `<button type="button" class="trp-btn-icon" data-action="complete-trip" data-trip-id="${d.id}" title="Edit completion odometer or diesel log">
               <i class="fa-solid fa-pen-to-square"></i> Fuel
             </button>`;

        return `
          <tr class="${isTransit ? "trp-row-transit" : ""}">
            <td style="font-family: monospace; font-weight: 700; color: #1677ff;">${this.escapeHtml(d.trip_code)}</td>
            <td>
              <span class="trp-plate-badge"><i class="fa-solid fa-truck"></i> ${this.escapeHtml(d.truck_register)}</span>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">${this.escapeHtml(d.truck_model)}</div>
            </td>
            <td>
              <div style="font-weight: 700;">${this.escapeHtml(d.driver_name)}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${this.escapeHtml(d.driver_mobile || d.driver_type)}</div>
            </td>
            <td style="max-width: 240px;">
              <div style="font-weight: 600;">${this.escapeHtml(d.destination || "Standard Delivery Route")}</div>
              ${jobTag}
              ${notesSub}
            </td>
            <td>
              <div style="font-size: 11.5px;"><strong>Out:</strong> ${this.escapeHtml(d.start_formatted)}</div>
              <div style="font-size: 11.5px; color: ${isTransit ? "#d97706" : "var(--text-muted)"};"><strong>In:</strong> ${this.escapeHtml(d.end_formatted)}</div>
            </td>
            <td>${odoHtml}</td>
            <td>${dieselHtml}</td>
            <td>${statusBadge}</td>
            <td class="text-right">
              <div class="trp-actions">
                ${primaryAction}
                <button type="button" class="trp-btn-icon danger" data-action="delete-trip" data-trip-id="${d.id}" title="Delete trip record">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  renderVehicles(vehicles = [], filters = {}) {
    const tbody = document.getElementById("trpVehiclesTbody");
    if (!tbody) return;

    const q = (filters.search || "").trim().toLowerCase();
    const statusFilter = filters.status || "ALL";

    const rows = vehicles.filter((v) => {
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
      if (q) {
        const hay = `${v.register} ${v.model_name} ${v.default_driver_name || ""} ${v.active_trip_driver_name || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (rows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="trp-empty-row">
            No fleet vehicles found. Click <strong>"Add Vehicle"</strong> to register a truck, van, or three-wheeler.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = rows
      .map((v) => {
        const statusClass =
          v.status === "On Trip"
            ? "ontrip"
            : v.status === "Maintenance"
              ? "maintenance"
              : "available";

        const driverHtml = v.default_driver_name
          ? `<div style="font-weight: 700;">${this.escapeHtml(v.default_driver_name)}</div>
             <div style="font-size: 11px; color: var(--text-muted);">${this.escapeHtml(v.default_driver_mobile || "Default Driver")}</div>`
          : `<span style="color: var(--text-muted); font-style: italic;">No default driver</span>`;

        const activeRouteNote = v.active_trip_id
          ? `<div style="font-size: 11px; color: #0284c7; margin-top: 2px;"><i class="fa-solid fa-route"></i> Active: ${this.escapeHtml(v.active_trip_destination || "In Transit")}</div>`
          : "";

        const effHtml = v.fuel_efficiency
          ? `<span class="trp-eff-pill">${v.fuel_efficiency} km/L</span>`
          : `<span style="color: var(--text-muted);">—</span>`;

        return `
          <tr>
            <td>
              <span class="trp-plate-badge"><i class="fa-solid fa-truck"></i> ${this.escapeHtml(v.register)}</span>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${this.escapeHtml(v.vehicle_code)}</div>
            </td>
            <td style="font-weight: 600;">
              ${this.escapeHtml(v.model_name)}
              ${activeRouteNote}
            </td>
            <td>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <div>${driverHtml}</div>
                <button type="button" class="trp-btn-icon" data-action="assign-vehicle-driver" data-vehicle-id="${v.id}" title="Assign or change driver for this vehicle">
                  <i class="fa-solid fa-user-Check"></i> <i class="fa-solid fa-id-badge"></i> Set Driver
                </button>
              </div>
            </td>
            <td style="font-family: monospace; font-weight: 700;">
              ${Number(v.current_km || 0).toLocaleString()} km
            </td>
            <td>${effHtml}</td>
            <td>
              <div style="font-weight: 600;">${v.trips_count} Trip${v.trips_count === 1 ? "" : "s"} • ${Number(v.total_km || 0).toLocaleString()} km</div>
              <div style="font-size: 11px; color: #059669; font-weight: 600;">${this.formatQty(v.total_diesel_liters || 0)} L (${this.formatCurrency(v.total_diesel_cost || 0)})</div>
            </td>
            <td>
              <span class="trp-status-pill ${statusClass}">${this.escapeHtml(v.status)}</span>
            </td>
            <td class="text-right">
              <div class="trp-actions">
                ${
                  v.status === "Available"
                    ? `<button type="button" class="trp-btn-icon" style="color: #1677ff; border-color: rgba(22,119,255,0.35);" data-action="dispatch-this-vehicle" data-vehicle-id="${v.id}" title="Start transport with this vehicle">
                         <i class="fa-solid fa-paper-plane"></i> Dispatch
                       </button>`
                    : v.active_trip_id
                      ? `<button type="button" class="trp-btn-complete" data-action="complete-trip" data-trip-id="${v.active_trip_id}" title="Complete active trip and log diesel">
                           <i class="fa-solid fa-gas-pump"></i> Complete
                         </button>`
                      : ""
                }
                <button type="button" class="trp-btn-icon" data-action="edit-vehicle" data-vehicle-id="${v.id}" title="Edit vehicle details">
                  <i class="fa-solid fa-pen"></i>
                </button>
                ${
                  v.trips_count === 0
                    ? `<button type="button" class="trp-btn-icon danger" data-action="delete-vehicle" data-vehicle-id="${v.id}" title="Remove vehicle">
                         <i class="fa-solid fa-trash-can"></i>
                       </button>`
                    : ""
                }
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  renderDrivers(drivers = [], search = "") {
    const tbody = document.getElementById("trpDriversTbody");
    if (!tbody) return;

    const q = (search || "").trim().toLowerCase();
    const rows = drivers.filter((d) => {
      if (!q) return true;
      const hay = `${d.full_name} ${d.nic} ${d.mobile} ${(d.assigned_vehicles || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });

    if (rows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="trp-empty-row">
            No drivers registered yet. Click <strong>"Add Driver"</strong> to register a driver.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = rows
      .map((d) => {
        const vehiclesHtml =
          Array.isArray(d.assigned_vehicles) && d.assigned_vehicles.length > 0
            ? d.assigned_vehicles
                .map(
                  (reg) =>
                    `<span class="trp-plate-badge" style="margin-right: 4px;"><i class="fa-solid fa-truck"></i> ${this.escapeHtml(reg)}</span>`
                )
                .join("")
            : `<span style="color: var(--text-muted);">—</span>`;

        const dutyBadge = d.is_on_trip
          ? `<span class="trp-status-pill transit"><i class="fa-solid fa-route"></i> On Trip (${this.escapeHtml(d.active_trip_truck || "")})</span>`
          : d.is_active
            ? `<span class="trp-status-pill available"><i class="fa-solid fa-circle-check"></i> Available</span>`
            : `<span class="trp-status-pill maintenance">${this.escapeHtml(d.status)}</span>`;

        return `
          <tr>
            <td>
              <div style="font-weight: 700;">${this.escapeHtml(d.full_name)}</div>
              <div style="font-size: 11px; color: #0284c7; font-weight: 600;">${this.escapeHtml(d.staff_type)}</div>
            </td>
            <td style="font-family: monospace;">${this.escapeHtml(d.nic)}</td>
            <td>${this.escapeHtml(d.mobile)}</td>
            <td>${vehiclesHtml}</td>
            <td>${dutyBadge}</td>
            <td>
              <div style="font-weight: 600;">${d.transports_count} Trip${d.transports_count === 1 ? "" : "s"} • ${Number(d.total_km || 0).toLocaleString()} km</div>
              <div style="font-size: 11px; color: var(--text-muted);">${this.formatQty(d.total_diesel_liters || 0)} L Diesel Logged</div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  renderDieselPrices(dieselPrices = []) {
    const tbody = document.getElementById("trpDieselTbody");
    if (!tbody) return;

    if (dieselPrices.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="trp-empty-row">No diesel price history recorded yet.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = dieselPrices
      .map((dp, idx) => {
        const badge =
          idx === 0
            ? `<span class="trp-status-pill available"><i class="fa-solid fa-bolt"></i> Current Active Rate</span>`
            : `<span class="trp-status-pill" style="background: rgba(100,116,139,0.12); color: var(--text-muted);">Historical Rate</span>`;

        return `
          <tr>
            <td style="font-family: monospace; font-weight: 700;">#DSL-${String(dp.id).padStart(3, "0")}</td>
            <td>${this.escapeHtml(dp.date_formatted)}</td>
            <td style="font-weight: 800; font-size: 14px; color: #059669;">${this.formatCurrency(dp.price)} / L</td>
            <td>${dp.transports_count} Trip${dp.transports_count === 1 ? "" : "s"}</td>
            <td>${badge}</td>
          </tr>
        `;
      })
      .join("");
  }
}

export default TransportTableRenderer;
