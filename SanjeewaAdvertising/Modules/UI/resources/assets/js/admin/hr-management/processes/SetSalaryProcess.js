/**
 * Set Base Salary Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 * HR Module Process:
 *  - Form input extraction and client-side validation
 *  - Communicating with HR Module backend endpoint (POST /admin/hr/salaries)
 *  - Handling authorization & validation errors (401/403/422)
 *  - Updating UI data store and triggering success notifications
 */

"use strict";

export class SetSalaryProcess {
  /**
   * @param {Object} [options={}]
   * @param {Object} [options.dataLoader] - Instance of HRManagementDataLoader
   * @param {Function} [options.onSuccess] - Callback when base salary is saved
   * @param {Function} [options.onError] - Callback on error
   * @param {string} [options.endpoint="/admin/hr/salaries"] - HR Module endpoint URL
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader || null;
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    this.endpoint = options.endpoint || "/admin/hr/salaries";
    this.isProcessing = false;
  }

  /**
   * Validate base salary input fields before submission.
   *
   * @param {Object} data
   * @returns {{isValid: boolean, error?: string}}
   */
  validate(data = {}) {
    const staffId = Number(data.staff_id);
    const amount = parseFloat(data.amount);

    if (!staffId || isNaN(staffId) || staffId <= 0) {
      return { isValid: false, error: "Please search and select a staff member." };
    }

    if (isNaN(amount) || amount <= 0) {
      return { isValid: false, error: "Please enter a valid monthly base salary greater than zero." };
    }

    if (amount > 9999999999.99) {
      return { isValid: false, error: "Base salary amount exceeds the maximum supported limit." };
    }

    return { isValid: true };
  }

  /**
   * Execute base salary update by sending POST request to HR Module.
   *
   * @param {Object} formData
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string, status?: number}>}
   */
  async execute(formData = {}) {
    if (this.isProcessing) {
      return { success: false, error: "A base salary update request is already in progress." };
    }

    const validation = this.validate(formData);
    if (!validation.isValid) {
      const err = validation.error;
      this.onError(err);
      return { success: false, error: err };
    }

    this.isProcessing = true;

    const payload = {
      staff_id: parseInt(formData.staff_id, 10),
      amount: parseFloat(Number(formData.amount).toFixed(2)),
    };

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

      const response = await fetch(this.endpoint, {
        method: "POST",
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
        let errorMsg = "Failed to update base salary. Please try again.";

        if (response.status === 403) {
          errorMsg = "Access Denied: Only administrators have permission to update base salaries.";
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

      const salaryResource = result?.data || result;
      const newSalary =
        this.dataLoader && typeof this.dataLoader.normalizeSalary === "function"
          ? this.dataLoader.normalizeSalary(salaryResource)
          : {
              id: Number(salaryResource.id),
              staff_id: Number(salaryResource.staff_id || payload.staff_id),
              staff_first_name: salaryResource.staff?.first_name || "",
              staff_last_name: salaryResource.staff?.last_name || "",
              staff_name:
                salaryResource.staff?.full_name ||
                `${salaryResource.staff?.first_name || ""} ${salaryResource.staff?.last_name || ""}`.trim() ||
                "Unknown Staff",
              staff_nic: salaryResource.staff?.nic || "—",
              staff_mobile: salaryResource.staff?.mobile || "—",
              staff_status: salaryResource.staff?.status?.staff_status || "Active",
              amount: parseFloat(salaryResource.amount ?? payload.amount),
              update_at: salaryResource.update_at || new Date().toISOString().slice(0, 16).replace("T", " "),
              monthly_payroll_total:
                salaryResource.monthly_payroll_total !== undefined
                  ? parseFloat(salaryResource.monthly_payroll_total)
                  : null,
            };

      if (this.dataLoader) {
        this.dataLoader.salaries = this.dataLoader.salaries.filter(
          (item) => Number(item.id) !== Number(newSalary.id)
        );
        this.dataLoader.salaries.unshift(newSalary);
      }

      const message = result?.message || "Base salary updated successfully.";
      this.onSuccess(newSalary, result);
      return { success: true, data: newSalary, message };
    } catch (networkError) {
      console.error("[SetSalaryProcess] Network/execution error:", networkError);
      const errMsg = networkError.message || "Network error while connecting to HR Module.";
      this.onError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      this.isProcessing = false;
    }
  }
}

export default SetSalaryProcess;
