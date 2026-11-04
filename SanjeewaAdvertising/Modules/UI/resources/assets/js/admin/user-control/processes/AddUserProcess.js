/**
 * Add User Process
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Admin Module Process:
 *  - Form input extraction and validation
 *  - Communicating with Admin Module backend endpoint (POST /admin/users)
 *  - Ensuring admin authorization & error handling (duplicate username/mobile, 403 forbidden)
 *  - Updating UI data store and triggering success notifications
 */

"use strict";

export class AddUserProcess {
  /**
   * @param {Object} options
   * @param {Object} options.dataLoader - Instance of UserControlDataLoader
   * @param {Function} [options.onSuccess] - Callback when user is successfully created
   * @param {Function} [options.onError] - Callback on error
   * @param {string} [options.endpoint] - API Endpoint URL (defaults to Admin Module endpoint)
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    this.endpoint = options.endpoint || "/admin/users";
    this.isProcessing = false;
  }

  /**
   * Validate user input fields
   * @param {Object} data
   * @returns {{isValid: boolean, error?: string}}
   */
  validate(data) {
    const { first_name, last_name, username, mobile, password, password_confirmation, user_statuses_id } = data;

    if (!first_name || !last_name || !username || !mobile || !password) {
      return { isValid: false, error: "Please fill in all required fields marked with *." };
    }

    if (username.length < 3) {
      return { isValid: false, error: "Username must be at least 3 characters long." };
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return { isValid: false, error: "Username can only contain alphanumeric characters, dots, and underscores." };
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

    if (!user_statuses_id || isNaN(Number(user_statuses_id))) {
      return { isValid: false, error: "Please select a valid user status." };
    }

    return { isValid: true };
  }

  /**
   * Execute the user creation process by sending POST request to User Module
   * @param {Object} formData
   * @returns {Promise<{success: boolean, data?: Object, message?: string, error?: string}>}
   */
  async execute(formData) {
    if (this.isProcessing) {
      return { success: false, error: "A user creation request is already in progress." };
    }

    // 1. Client-side input validation
    const validation = this.validate(formData);
    if (!validation.isValid) {
      const err = validation.error;
      this.onError(err);
      return { success: false, error: err };
    }

    this.isProcessing = true;

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      username: formData.username.trim(),
      mobile: formData.mobile.trim(),
      password: formData.password,
      user_statuses_id: parseInt(formData.user_statuses_id, 10)
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
        let errorMsg = "Failed to create user. Please try again.";

        if (response.status === 403) {
          errorMsg = "Access Denied: Only administrators have permission to add new users.";
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

      // Successful creation (201 Created)
      const userResource = result?.data || result;
      const statusMap = {
        1: "Active",
        2: "Inactive",
        3: "Suspended",
        4: "Pending"
      };

      const newUser = {
        id: userResource.id,
        first_name: userResource.first_name || payload.first_name,
        last_name: userResource.last_name || payload.last_name,
        username: userResource.username || payload.username,
        mobile: userResource.mobile || payload.mobile,
        user_statuses_id: userResource.user_statuses_id || payload.user_statuses_id,
        status: userResource.status?.user_status || statusMap[payload.user_statuses_id] || "Active",
        is_login: Boolean(userResource.is_login),
        register_at: userResource.register_at || new Date().toISOString().replace("T", " ").substring(0, 19)
      };

      // Synchronize in DataLoader if available
      if (this.dataLoader) {
        this.dataLoader.users = this.dataLoader.users.filter(u => u.id !== newUser.id);
        this.dataLoader.users.unshift(newUser);
        this.dataLoader.saveUsers();
      }

      this.onSuccess(newUser, result);
      return { success: true, data: newUser, message: result?.message || "User created successfully." };

    } catch (networkError) {
      console.error("[AddUserProcess] Network/execution error:", networkError);
      const errMsg = networkError.message || "Network error while connecting to User Module.";
      this.onError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      this.isProcessing = false;
    }
  }
}

