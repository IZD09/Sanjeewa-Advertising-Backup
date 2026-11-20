/**
 * Change Staff Employment Status Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

import { HRManagementDataLoader } from "../HRManagementDataLoader.js";
import { UpdateStaffStatusProcess } from "../processes/UpdateStaffStatusProcess.js";

export class ChangeStaffStatusModal {
  /**
   * @param {Object} [options={}]
   * @param {Object} [options.dataLoader]
   * @param {Function} [options.onStatusUpdated]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader || null;
    this.onStatusUpdated = options.onStatusUpdated || (() => {});

    this.overlay = document.getElementById("modalChangeStaffStatus");
    this.form = document.getElementById("formChangeStaffStatus");
    this.errorEl = document.getElementById("changeStaffStatusError");
    this.staffIdInput = document.getElementById("changeStatusStaffId");
    this.avatarEl = document.getElementById("changeStatusStaffAvatar");
    this.nameEl = document.getElementById("changeStatusStaffName");
    this.metaEl = document.getElementById("changeStatusStaffMeta");
    this.currentBadgeEl = document.getElementById("changeStatusCurrentBadge");
    this.optionsListEl = document.getElementById("changeStatusOptionsList");
    this.closeBtns = this.overlay ? this.overlay.querySelectorAll(".hr-modal-close-trigger") : [];
    this.submitBtn = this.form ? this.form.querySelector('button[type="submit"]') : null;

    this.process = new UpdateStaffStatusProcess({
      dataLoader: this.dataLoader,
      onError: (errMsg) => {
        this.showError(errMsg);
      },
    });

    this.bindEvents();
  }

  bindEvents() {
    this.closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });

    if (this.overlay) {
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    this.optionsListEl?.addEventListener("change", () => {
      this.syncOptionCardSelection();
    });

    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submit();
      });
    }
  }

  escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  syncOptionCardSelection() {
    if (!this.optionsListEl) return;

    this.optionsListEl.querySelectorAll(".hr-status-option-item").forEach((label) => {
      const radio = label.querySelector('input[type="radio"]');
      label.classList.toggle("selected", Boolean(radio?.checked));
    });
  }

  /**
   * Open Change Staff Status modal for a staff member.
   *
   * @param {Object} staffInfo
   * @param {string|number} staffInfo.id
   * @param {string} [staffInfo.name]
   * @param {string} [staffInfo.nic]
   * @param {string|number} [staffInfo.statusId]
   * @param {string} [staffInfo.statusLabel]
   */
  open(staffInfo = {}) {
    if (!this.overlay || !staffInfo.id) return;

    this.clearError();
    if (this.form) this.form.reset();

    const paddedId = String(staffInfo.id).padStart(3, "0");
    const fullName = staffInfo.name || "Staff Member";
    const nameParts = fullName.trim().split(/\s+/);
    const initials = `${nameParts[0]?.[0] || "S"}${nameParts[1]?.[0] || ""}`.toUpperCase();
    const statusLabel = staffInfo.statusLabel || "Active";
    const badgeClass = HRManagementDataLoader.resolveStatusBadgeClass(statusLabel);

    if (this.staffIdInput) this.staffIdInput.value = String(staffInfo.id);
    if (this.avatarEl) this.avatarEl.textContent = initials;
    if (this.nameEl) this.nameEl.textContent = fullName;
    if (this.metaEl) this.metaEl.textContent = `ID #STF-${paddedId}${staffInfo.nic ? ` • ${staffInfo.nic}` : ""}`;
    if (this.currentBadgeEl) {
      this.currentBadgeEl.className = `hr-tag ${badgeClass}`;
      this.currentBadgeEl.innerHTML = `<span class="hr-dot"></span> ${this.escapeHtml(statusLabel)}`;
    }

    // Pre-select current status radio option
    if (this.optionsListEl) {
      const targetRadio =
        this.optionsListEl.querySelector(`input[name="staff_statuses_id"][value="${staffInfo.statusId}"]`) ||
        Array.from(this.optionsListEl.querySelectorAll('input[name="staff_statuses_id"]')).find(
          (r) => String(r.getAttribute("data-status-label") || "").toLowerCase() === statusLabel.toLowerCase()
        );

      if (targetRadio) {
        targetRadio.checked = true;
      }
      this.syncOptionCardSelection();
    }

    this.overlay.classList.add("open");
  }

  close() {
    if (!this.overlay) return;
    this.clearError();
    this.overlay.classList.remove("open");
  }

  showError(message) {
    if (this.errorEl) {
      this.errorEl.textContent = message;
      this.errorEl.style.display = "block";
    } else {
      alert(message);
    }
  }

  clearError() {
    if (this.errorEl) {
      this.errorEl.textContent = "";
      this.errorEl.style.display = "none";
    }
  }

  async submit() {
    this.clearError();

    const staffId = this.staffIdInput?.value || "";
    const selectedRadio = this.optionsListEl?.querySelector('input[name="staff_statuses_id"]:checked');
    const statusId = selectedRadio?.value || "";

    const originalBtnHtml = this.submitBtn
      ? this.submitBtn.innerHTML
      : '<i class="fa-solid fa-check"></i> Update Status';

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';
    }

    try {
      const result = await this.process.execute({
        staff_id: staffId,
        staff_statuses_id: statusId,
      });

      if (result.success && result.data) {
        this.close();
        this.onStatusUpdated(result.data, result.message);
      }
    } finally {
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalBtnHtml;
      }
    }
  }
}

export default ChangeStaffStatusModal;
