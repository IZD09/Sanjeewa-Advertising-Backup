/**
 * Update Staff Status Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 * HR Module Process:
 *  - Validates selected staff member & target status ID
 *  - Sends PATCH /admin/hr/staff/{id}/status with CSRF + JSON headers
 *  - Handles 401/403/404/422 errors and synchronizes DataLoader state
 */

"use strict";

export class UpdateStaffStatusProcess {
  /**
   * @param {Object} [options={}]
   * @param {Object} [options.dataLoader]
   * @param {Function} [options.onSuccess]
   * @param {Function} [options.onError]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader || null;
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    this.isProcessing = false;
  }

  /**
   * Validate staff status update parameters.
   *
   * @param {Object} data
   * @returns {{isValid: boolean, error?: string}}
   */
  validate(data = {}) {
    const staffId = Number(data.staff_id);
    const statusId = Number(data.staff_statuses_id);

    if (!staffId || isNaN(staffId) || staffId <= 0) {
      return { isValid: false, error: "Invalid staff member selected." };
    }

    if (!statusId || isNaN(statusId) || statusId <= 0) {
      return { isValid: false, error: "Please select an employment status." };
    }

    return { isValid: true };
  }

  /**
   * Execute staff status update via HR Module PATCH endpoint.
   *
   * @param {Object} formData
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string, status?: number}>}
   */
  async execute(formData = {}) {
    if (this.isProcessing) {
      return { success: false, error: "A status update request is already in progress." };
    }

    const validation = this.validate(formData);
    if (!validation.isValid) {
      const err = validation.error;
      this.onError(err);
      return { success: false, error: err };
    }

    this.isProcessing = true;

    const staffId = parseInt(formData.staff_id, 10);
    const payload = {
      staff_statuses_id: parseInt(formData.staff_statuses_id, 10),
    };

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

      const response = await fetch(`/admin/hr/staff/${staffId}/status`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMsg = "Failed to update staff status. Please try again.";

        if (response.status === 403) {
          errorMsg = "Access Denied: Only administrators can update staff status.";
        } else if (response.status === 401) {
          errorMsg = "Session expired. Please log in as an administrator.";
        } else if (response.status === 422 && result?.errors) {
          const firstKey = Object.keys(result.errors)[0];
          errorMsg = result.errors[firstKey]?.[0] || result.message || errorMsg;
        } else if (result?.message) {
          errorMsg = result.message;
        }

        this.onError(errorMsg, result);
        return { success: false, error: errorMsg, status: response.status };
      }

      const staffResource = result?.data || result;
      const normalized =
        this.dataLoader && typeof this.dataLoader.normalizeStaff === "function"
          ? this.dataLoader.normalizeStaff(staffResource)
          : {
              id: Number(staffResource.id || staffId),
              first_name: staffResource.first_name || "",
              last_name: staffResource.last_name || "",
              full_name: staffResource.full_name || "",
              nic: staffResource.nic || "",
              mobile: staffResource.mobile || "",
              staff_statuses_id: Number(staffResource.staff_statuses_id || payload.staff_statuses_id),
              status: staffResource.status?.staff_status || "Active",
            };

      normalized.kpi_active_staff =
        staffResource.kpi_active_staff !== undefined ? Number(staffResource.kpi_active_staff) : null;
      normalized.kpi_on_leave_staff =
        staffResource.kpi_on_leave_staff !== undefined ? Number(staffResource.kpi_on_leave_staff) : null;

      const message = result?.message || "Staff status updated successfully.";
      this.onSuccess(normalized, result);
      return { success: true, data: normalized, message };
    } catch (networkError) {
      console.error("[UpdateStaffStatusProcess] Network/execution error:", networkError);
      const errMsg = networkError.message || "Network error while connecting to HR Module.";
      this.onError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      this.isProcessing = false;
    }
  }
}

export default UpdateStaffStatusProcess;
