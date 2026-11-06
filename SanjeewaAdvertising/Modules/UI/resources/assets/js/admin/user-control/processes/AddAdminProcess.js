/**
 * Add Admin Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Admin Module Process:
 *  - Form input extraction and validation
 *  - Communicating with Admin Module backend endpoint (POST /admin/admins)
 *  - Ensuring admin authorization & error handling (duplicate username/email/mobile, 403 forbidden)
 *  - Updating UI data store and triggering success notifications
 */

"use strict";

export class AddAdminProcess {
  /**
   * @param {Object} options
   * @param {Object} options.dataLoader - Instance of UserControlDataLoader
   * @param {Function} [options.onSuccess] - Callback when admin is successfully created
   * @param {Function} [options.onError] - Callback on error
   * @param {string} [options.endpoint] - API Endpoint URL (defaults to Admin Module endpoint)
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    this.endpoint = options.endpoint || "/admin/admins";
    this.isProcessing = false;

    this.typeMapByName = {
      "Super Admin": 1,
      "Administrator": 2,
      "Manager": 3,
      "Accountant": 4,
      "Operator": 5
    };

    this.statusMapByName = {
      "Active": 1,
      "Inactive": 2,
      "Suspended": 3,
      "Locked": 4
    };
  }

  resolveAdminTypeId(rawType) {
    if (rawType === undefined || rawType === null || rawType === "") return 2;
    const num = Number(rawType);
    if (!isNaN(num) && num > 0) return num;
    return this.typeMapByName[String(rawType).trim()] || 2;
  }

  resolveAdminStatusId(rawStatus) {
    if (rawStatus === undefined || rawStatus === null || rawStatus === "") return 1;
    const num = Number(rawStatus);
    if (!isNaN(num) && num > 0) return num;
    return this.statusMapByName[String(rawStatus).trim()] || 1;
  }

  /**
   * Validate administrator input fields
   * @param {Object} data
   * @returns {{isValid: boolean, error?: string}}
   */
  validate(data) {
    const { first_name, last_name, username, email, mobile, password, password_confirmation } = data;
    const adminTypesId = this.resolveAdminTypeId(data.admin_types_id ?? data.type);
    const adminStatusesId = this.resolveAdminStatusId(data.admin_statuses_id ?? data.status);

    if (!first_name || !last_name || !username || !email || !mobile || !password) {
      return { isValid: false, error: "Please fill in all required fields marked with *." };
    }

    if (username.length < 3) {
      return { isValid: false, error: "Admin username must be at least 3 characters long." };
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return { isValid: false, error: "Admin username can only contain alphanumeric characters, dots, and underscores." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { isValid: false, error: "Please enter a valid email address." };
    }

    if (!/^[0-9+() -]{9,15}$/.test(mobile)) {
      return { isValid: false, error: "Please enter a valid mobile phone number." };
    }

    if (password.length < 6) {
      return { isValid: false, error: "Password must be at least 6 characters long." };
    }

    if (password_confirmation !== undefined && password !== password_confirmation) {
      return { isValid: false, error: "Password and Confirm Password do not match." };
    }

    if (!adminTypesId || isNaN(Number(adminTypesId))) {
      return { isValid: false, error: "Please select a valid admin privilege type." };
    }

    if (!adminStatusesId || isNaN(Number(adminStatusesId))) {
      return { isValid: false, error: "Please select a valid account status." };
    }

    return { isValid: true };
  }

  /**
   * Execute the administrator creation process by sending POST request to Admin Module
   * @param {Object} formData
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string}>}
   */
  async execute(formData) {
    if (this.isProcessing) {
      return { success: false, error: "An administrator creation request is already in progress." };
    }

    const validation = this.validate(formData);
    if (!validation.isValid) {
      const err = validation.error;
      this.onError(err);
      return { success: false, error: err };
    }

    this.isProcessing = true;

    const adminTypesId = this.resolveAdminTypeId(formData.admin_types_id ?? formData.type);
    const adminStatusesId = this.resolveAdminStatusId(formData.admin_statuses_id ?? formData.status);

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
      password: formData.password,
      admin_types_id: adminTypesId,
      admin_statuses_id: adminStatusesId
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
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMsg = "Failed to provision administrator. Please try again.";

        if (response.status === 403) {
          errorMsg = "Access Denied: Only administrators have permission to provision new administrators.";
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

      const adminResource = result?.data || result;
      const newAdmin = this.dataLoader && typeof this.dataLoader.normalizeAdmin === "function"
        ? this.dataLoader.normalizeAdmin(adminResource)
        : {
            id: Number(adminResource.id),
            first_name: adminResource.first_name || payload.first_name,
            last_name: adminResource.last_name || payload.last_name,
            username: adminResource.username || payload.username,
            email: adminResource.email || payload.email,
            mobile: adminResource.mobile || payload.mobile,
            add_time: adminResource.add_time || new Date().toISOString().replace("T", " ").substring(0, 19),
            admin_types_id: Number(adminResource.admin_types_id || payload.admin_types_id),
            admin_statuses_id: Number(adminResource.admin_statuses_id || payload.admin_statuses_id),
            type: adminResource.type?.admin_type || adminResource.type?.name || "Administrator",
            status: adminResource.status?.admin_statas || adminResource.status?.name || "Active"
          };

      if (this.dataLoader) {
        this.dataLoader.admins = this.dataLoader.admins.filter(a => Number(a.id) !== Number(newAdmin.id));
        this.dataLoader.admins.unshift(newAdmin);
        this.dataLoader.saveAdmins();
      }

      this.onSuccess(newAdmin, result);
      return { success: true, data: newAdmin, message: result?.message || "Admin created successfully." };
    } catch (networkError) {
      console.error("[AddAdminProcess] Network/execution error:", networkError);
      const errMsg = networkError.message || "Network error while connecting to Admin Module.";
      this.onError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      this.isProcessing = false;
    }
  }
}

