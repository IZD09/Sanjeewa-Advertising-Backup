/**
 * SanjeewaAdvertising - Admin Transport Data Service
 *
 * Wraps REST API calls under /advertising/transport/* via core RequestHandler.
 */

"use strict";

import { RequestHandler } from "../../core/RequestHandler.js";

export class TransportDataService {
  constructor() {
    this.http = new RequestHandler();
  }

  async fetchDashboardData() {
    const res = await this.http.get("/advertising/transport/data");
    return res?.data || null;
  }

  async createVehicle(payload) {
    return this.http.post("/advertising/transport/vehicles", payload);
  }

  async updateVehicle(truckId, payload) {
    return this.http.put(`/advertising/transport/vehicles/${truckId}`, payload);
  }

  async assignVehicleDriver(truckId, payload) {
    return this.http.patch(`/advertising/transport/vehicles/${truckId}/driver`, payload);
  }

  async deleteVehicle(truckId) {
    return this.http.delete(`/advertising/transport/vehicles/${truckId}`);
  }

  async startDispatch(payload) {
    return this.http.post("/advertising/transport/trips", payload);
  }

  async assignTripDriver(tripId, staffId) {
    return this.http.patch(`/advertising/transport/trips/${tripId}/driver`, {
      staff_id: staffId,
    });
  }

  async completeTrip(tripId, payload) {
    return this.http.patch(`/advertising/transport/trips/${tripId}/complete`, payload);
  }

  async deleteTrip(tripId) {
    return this.http.delete(`/advertising/transport/trips/${tripId}`);
  }

  async addDieselPrice(payload) {
    return this.http.post("/advertising/transport/diesel-prices", payload);
  }

  async registerDriver(payload) {
    return this.http.post("/advertising/transport/drivers", payload);
  }
}

export default TransportDataService;
