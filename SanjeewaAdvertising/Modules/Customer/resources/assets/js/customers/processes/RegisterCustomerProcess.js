/**
 * SanjeewaAdvertising - Register Customer Process
 *
 * Handles customer registration workflow using the Customer Module API:
 * - Input validation (name, mobile)
 * - Sending creation request to Customer module endpoint
 * - Modal management, state update, and feedback notification
 */

export class RegisterCustomerProcess {
  /**
   * @param {Object} options
   * @param {Object} options.dataLoader - Instance of CustomerDataLoader
   * @param {Function} [options.openModal]
   * @param {Function} [options.closeModal]
   * @param {Function} [options.showToast]
   * @param {Function} [options.onCustomerRegistered]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader;
    this.openModal = options.openModal || (() => {});
    this.closeModal = options.closeModal || (() => {});
    this.showToast = options.showToast || (() => {});
    this.onCustomerRegistered = options.onCustomerRegistered || (() => {});

    this.bindEvents();
  }

  bindEvents() {
    const saveBtn = document.getElementById("saveNewCustomerBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.submit();
      });
    }
  }

  validate(name, mobile) {
    if (!name || name.trim().length < 2) {
      return { isValid: false, error: "Please enter a valid customer full name." };
    }
    const cleanMobile = (mobile || "").replace(/\s+/g, "");
    if (!cleanMobile || cleanMobile.length < 9) {
      return { isValid: false, error: "Please enter a valid phone number (at least 9 digits)." };
    }
    return { isValid: true };
  }

  async submit() {
    const nameInput = document.getElementById("newCustName");
    const mobileInput = document.getElementById("newCustMobile");
    const addressInput = document.getElementById("newCustAddress");
    const typeSelect = document.getElementById("newCustType");

    const name = nameInput?.value?.trim() || "";
    const mobile = mobileInput?.value?.trim() || "";
    const address = addressInput?.value?.trim() || "";
    const type = typeSelect?.value || "Regular";

    const validation = this.validate(name, mobile);
    if (!validation.isValid) {
      this.showToast(validation.error, "error");
      return;
    }

    const saveBtn = document.getElementById("saveNewCustomerBtn");
    const origText = saveBtn ? saveBtn.innerHTML : "";

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';
    }

    try {
      const payload = {
        name,
        mobile,
        email: null,
        register_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      };

      const result = await this.dataLoader.createCustomer(payload);

      if (result && result.success === false) {
        throw new Error(result.message || "Failed to register customer.");
      }

      const createdCustomer = result?.data || result;
      // Attach UI-specific attributes
      createdCustomer.address = address;
      createdCustomer.badge = type;

      this.showToast(`Customer "${name}" registered successfully!`, "success");
      this.closeModal("addCustomerModal");
      this.resetForm();

      this.onCustomerRegistered(createdCustomer);
    } catch (err) {
      console.error("[RegisterCustomerProcess] Error:", err);
      const errMsg =
        err?.data?.message ||
        (err?.data?.errors ? Object.values(err.data.errors).flat().join(" ") : null) ||
        err?.message ||
        "Could not register customer. Ensure phone number is unique.";
      this.showToast(errMsg, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = origText;
      }
    }
  }

  resetForm() {
    const nameInput = document.getElementById("newCustName");
    const mobileInput = document.getElementById("newCustMobile");
    const addressInput = document.getElementById("newCustAddress");
    const typeSelect = document.getElementById("newCustType");

    if (nameInput) nameInput.value = "";
    if (mobileInput) mobileInput.value = "";
    if (addressInput) addressInput.value = "";
    if (typeSelect) typeSelect.value = "Regular";
  }
}

export default RegisterCustomerProcess;

