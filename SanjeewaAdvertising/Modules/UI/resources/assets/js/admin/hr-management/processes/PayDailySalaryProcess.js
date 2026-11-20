/**
 * Pay Daily Salary Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 * HR Module Process:
 *  - Form input extraction and client-side validation
 *  - Communicating with HR Module backend endpoint (POST /admin/hr/daily-salaries)
 *  - Handling authorization & validation errors (401/403/422)
 *  - Updating UI data store and triggering success notifications
 */

"use strict";

export class PayDailySalaryProcess {
  /**
   * @param {Object} [options={}]
   * @param {Object} [options.dataLoader] - Instance of HRManagementDataLoader
   * @param {Function} [options.onSuccess] - Callback when daily salary payment is recorded
   * @param {Function} [options.onError] - Callback on error
   * @param {string} [options.endpoint="/admin/hr/daily-salaries"] - HR Module endpoint URL
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader || null;
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    this.endpoint = options.endpoint || "/admin/hr/daily-salaries";
    this.isProcessing = false;
  }

  /**
   * Validate daily salary payment input fields before submission.
   *
   * @param {Object} data
   * @returns {{isValid: boolean, error?: string}}
   */
  validate(data = {}) {
    const staffId = Number(data.staff_id);
    const amount = parseFloat(data.amount);
    const payAt = String(data.pay_at || "").trim();

    if (!staffId || isNaN(staffId) || staffId <= 0) {
      return { isValid: false, error: "Please search and select a staff member." };
    }

    if (isNaN(amount) || amount <= 0) {
      return { isValid: false, error: "Please enter a valid payment amount greater than zero." };
    }

    if (amount > 9999999999.99) {
      return { isValid: false, error: "Payment amount exceeds the maximum supported limit." };
    }

    if (!payAt) {
      return { isValid: false, error: "Please select the payment date and time." };
    }

    return { isValid: true };
  }

  /**
   * Execute daily salary payment recording by sending POST request to HR Module.
   *
   * @param {Object} formData
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string, status?: number}>}
   */
  async execute(formData = {}) {
    if (this.isProcessing) {
      return { success: false, error: "A daily salary payment request is already in progress." };
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
      pay_at: String(formData.pay_at).trim(),
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
        let errorMsg = "Failed to record daily salary payment. Please try again.";

        if (response.status === 403) {
          errorMsg = "Access Denied: Only administrators have permission to record daily salary payments.";
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

      const paymentResource = result?.data || result;
      const newPayment =
        this.dataLoader && typeof this.dataLoader.normalizeDailySalary === "function"
          ? this.dataLoader.normalizeDailySalary(paymentResource)
          : {
              id: Number(paymentResource.id),
              staff_id: Number(paymentResource.staff_id || payload.staff_id),
              staff_first_name: paymentResource.staff?.first_name || "",
              staff_last_name: paymentResource.staff?.last_name || "",
              staff_name:
                paymentResource.staff?.full_name ||
                `${paymentResource.staff?.first_name || ""} ${paymentResource.staff?.last_name || ""}`.trim() ||
                "Unknown Staff",
              staff_nic: paymentResource.staff?.nic || "—",
              staff_mobile: paymentResource.staff?.mobile || "—",
              amount: parseFloat(paymentResource.amount ?? payload.amount),
              pay_at: paymentResource.pay_at || payload.pay_at.replace("T", " "),
              pay_at_date: paymentResource.pay_at_date || payload.pay_at.slice(0, 10),
              pay_at_month: paymentResource.pay_at_month || payload.pay_at.slice(0, 7),
              daily_salary_total:
                paymentResource.daily_salary_total !== undefined
                  ? parseFloat(paymentResource.daily_salary_total)
                  : null,
              daily_salary_count:
                paymentResource.daily_salary_count !== undefined
                  ? parseInt(paymentResource.daily_salary_count, 10)
                  : null,
            };

      if (this.dataLoader) {
        this.dataLoader.dailySalaries = this.dataLoader.dailySalaries.filter(
          (item) => Number(item.id) !== Number(newPayment.id)
        );
        this.dataLoader.dailySalaries.unshift(newPayment);
      }

      const message = result?.message || "Daily salary payment recorded successfully.";
      this.onSuccess(newPayment, result);
      return { success: true, data: newPayment, message };
    } catch (networkError) {
      console.error("[PayDailySalaryProcess] Network/execution error:", networkError);
      const errMsg = networkError.message || "Network error while connecting to HR Module.";
      this.onError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      this.isProcessing = false;
    }
  }
}

export default PayDailySalaryProcess;
