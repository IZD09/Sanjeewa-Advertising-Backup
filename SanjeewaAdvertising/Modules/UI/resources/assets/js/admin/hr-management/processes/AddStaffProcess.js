/**
 * Add Staff Member Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 * HR Module Process:
 *  - Form input extraction and client-side validation
 *  - Communicating with HR Module backend endpoint (POST /admin/hr/staff)
 *  - Handling authorization & validation errors (duplicate NIC, 401/403/422)
 *  - Updating UI data store and triggering success notifications
 */

"use strict";

export class AddStaffProcess {
  /**
   * @param {Object} [options={}]
   * @param {Object} [options.dataLoader] - Instance of HRManagementDataLoader
   * @param {Function} [options.onSuccess] - Callback when staff member is created
   * @param {Function} [options.onError] - Callback on error
   * @param {string} [options.endpoint="/admin/hr/staff"] - HR Module endpoint URL
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader || null;
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    this.endpoint = options.endpoint || "/admin/hr/staff";
    this.isProcessing = false;
  }

  /**
   * Validate staff input fields before submission.
   *
   * @param {Object} data
   * @returns {{isValid: boolean, error?: string}}
   */
  validate(data = {}) {
    const firstName = String(data.first_name || "").trim();
    const lastName = String(data.last_name || "").trim();
    const nic = String(data.nic || "").trim();
    const mobile = String(data.mobile || "").trim();

    if (!firstName || !lastName || !nic || !mobile) {
      return { isValid: false, error: "Please fill in all required fields marked with *." };
    }

    if (firstName.length > 50 || lastName.length > 50) {
      return { isValid: false, error: "First name and last name must be 50 characters or fewer." };
    }

    if (nic.length < 9 || nic.length > 15 || !/^[0-9A-Za-z-]+$/.test(nic)) {
      return { isValid: false, error: "Please enter a valid NIC number (9–15 characters)." };
    }

    if (!/^[0-9+() -]{9,15}$/.test(mobile)) {
      return { isValid: false, error: "Please enter a valid mobile phone number." };
    }

    return { isValid: true };
  }

  /**
   * Execute staff creation by sending POST request to HR Module.
   *
   * @param {Object} formData
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string, status?: number}>}
   */
  async execute(formData = {}) {
    if (this.isProcessing) {
      return { success: false, error: "A staff registration request is already in progress." };
    }

    const validation = this.validate(formData);
    if (!validation.isValid) {
      const err = validation.error;
      this.onError(err);
      return { success: false, error: err };
    }

    this.isProcessing = true;

    const payload = {
      first_name: String(formData.first_name).trim(),
      last_name: String(formData.last_name).trim(),
      nic: String(formData.nic).trim().toUpperCase(),
      mobile: String(formData.mobile).trim(),
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
        let errorMsg = "Failed to add staff member. Please try again.";

        if (response.status === 403) {
          errorMsg = "Access Denied: Only administrators have permission to register staff members.";
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
      const newStaff = this.dataLoader && typeof this.dataLoader.normalizeStaff === "function"
        ? this.dataLoader.normalizeStaff(staffResource)
        : {
            id: Number(staffResource.id),
            first_name: staffResource.first_name || payload.first_name,
            last_name: staffResource.last_name || payload.last_name,
            nic: staffResource.nic || payload.nic,
            mobile: staffResource.mobile || payload.mobile,
            staff_statuses_id: Number(staffResource.staff_statuses_id) || 1,
            status: staffResource.status?.staff_status || "Active",
            add_at: staffResource.add_at || new Date().toISOString().slice(0, 10),
            add_at_date: staffResource.add_at_date || new Date().toISOString().slice(0, 10),
            added_by: staffResource.added_by?.full_name || "System Admin",
            latest_salary: staffResource.latest_salary ?? null,
          };

      if (this.dataLoader) {
        this.dataLoader.staffMembers = this.dataLoader.staffMembers.filter(
          (member) => Number(member.id) !== Number(newStaff.id)
        );
        this.dataLoader.staffMembers.unshift(newStaff);
      }

      const message = result?.message || "Staff member added successfully.";
      this.onSuccess(newStaff, result);
      return { success: true, data: newStaff, message };
    } catch (networkError) {
      console.error("[AddStaffProcess] Network/execution error:", networkError);
      const errMsg = networkError.message || "Network error while connecting to HR Module.";
      this.onError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      this.isProcessing = false;
    }
  }
}

export default AddStaffProcess;
