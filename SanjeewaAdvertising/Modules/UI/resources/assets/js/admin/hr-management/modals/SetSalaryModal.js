/**
 * Set Base Salary Modal Handler
 * Sanjeewa Advertising Digital Printing Shop Management System
 * Includes searchable Staff Member combobox with keyboard navigation and live filtering.
 */

"use strict";

import { SetSalaryProcess } from "../processes/SetSalaryProcess.js";

export class SetSalaryModal {
  /**
   * @param {Object} [options={}]
   * @param {Object} [options.dataLoader]
   * @param {Function} [options.onSalaryUpdated]
   */
  constructor(options = {}) {
    this.dataLoader = options.dataLoader || null;
    this.onSalaryUpdated = options.onSalaryUpdated || (() => {});

    this.overlay = document.getElementById("modalSetSalary");
    this.form = document.getElementById("formSetSalary");
    this.errorEl = document.getElementById("setSalaryError");
    this.combobox = document.getElementById("salaryStaffCombobox");
    this.searchInput = document.getElementById("hrSalaryStaffSearch");
    this.clearBtn = document.getElementById("btnSalaryStaffClear");
    this.toggleBtn = document.getElementById("btnSalaryStaffToggle");
    this.resultsEl = document.getElementById("hrSalaryStaffResults");
    this.staffIdInput = document.getElementById("hrSalaryStaffId");
    this.selectedHintEl = document.getElementById("hrSalarySelectedHint");
    this.amountInput = document.getElementById("hrSalaryAmount");
    this.closeBtns = this.overlay ? this.overlay.querySelectorAll(".hr-modal-close-trigger") : [];
    this.submitBtn = this.form ? this.form.querySelector('button[type="submit"]') : null;

    this.process = new SetSalaryProcess({
      dataLoader: this.dataLoader,
      onError: (errMsg) => {
        this.showError(errMsg);
      },
    });

    this.staffList = this.loadInitialStaffList();
    this.filteredStaff = [...this.staffList];
    this.highlightedIndex = -1;
    this.isDropdownOpen = false;
    this.selectedStaff = null;

    this.bindEvents();
  }

  /**
   * Parse initial staff dataset embedded on #salaryStaffCombobox.
   *
   * @returns {Array<Object>}
   */
  loadInitialStaffList() {
    if (!this.combobox) return [];

    try {
      const raw = this.combobox.getAttribute("data-staff-list") || "[]";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn("[SetSalaryModal] Could not parse staff list:", err);
      return [];
    }
  }

  /**
   * Register a newly added staff member into the searchable selector list.
   *
   * @param {Object} staff
   */
  addStaffOption(staff) {
    if (!staff || !staff.id) return;

    const normalized = {
      id: Number(staff.id),
      full_name: staff.full_name || `${staff.first_name || ""} ${staff.last_name || ""}`.trim(),
      nic: String(staff.nic || ""),
      mobile: String(staff.mobile || ""),
      status: String(staff.status?.staff_status || staff.status || "Active"),
      latest_salary: staff.latest_salary ?? null,
    };

    this.staffList = this.staffList.filter((item) => Number(item.id) !== normalized.id);
    this.staffList.unshift(normalized);
  }

  /**
   * Format staff display text inside the search input.
   *
   * @param {Object} staff
   * @returns {string}
   */
  formatStaffDisplay(staff) {
    if (!staff) return "";
    const paddedId = String(staff.id).padStart(3, "0");
    return `#STF-${paddedId} - ${staff.full_name} (${staff.nic})`;
  }

  /**
   * Escape HTML special characters for safe dropdown rendering.
   *
   * @param {*} value
   * @returns {string}
   */
  escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        this.handleSearchInput();
      });

      this.searchInput.addEventListener("focus", () => {
        this.openDropdown(this.selectedStaff ? "" : this.searchInput.value);
      });

      this.searchInput.addEventListener("click", () => {
        if (!this.isDropdownOpen) {
          this.openDropdown(this.selectedStaff ? "" : this.searchInput.value);
        }
      });

      this.searchInput.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!this.isDropdownOpen) {
            this.openDropdown(this.searchInput.value);
          } else {
            this.moveHighlight(1);
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (this.isDropdownOpen) {
            this.moveHighlight(-1);
          }
        } else if (e.key === "Enter") {
          if (this.isDropdownOpen) {
            e.preventDefault();
            this.selectHighlightedOrFirst();
          }
        } else if (e.key === "Escape") {
          if (this.isDropdownOpen) {
            e.preventDefault();
            e.stopPropagation();
            this.closeDropdown(true);
          }
        }
      });
    }

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (this.isDropdownOpen) {
          this.closeDropdown(true);
        } else {
          this.openDropdown("");
          this.searchInput?.focus();
          this.searchInput?.select();
        }
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.clearSelection(true);
      });
    }

    if (this.resultsEl) {
      this.resultsEl.addEventListener("click", (e) => {
        const item = e.target.closest(".hr-combobox-item[data-staff-id]");
        if (!item) return;

        const staffId = Number(item.getAttribute("data-staff-id"));
        const match = this.staffList.find((s) => Number(s.id) === staffId);
        if (match) {
          this.selectStaff(match);
        }
      });
    }

    document.addEventListener("click", (e) => {
      if (this.isDropdownOpen && this.combobox && !this.combobox.contains(e.target)) {
        this.closeDropdown(true);
      }
    });

    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submit();
      });
    }
  }

  handleSearchInput() {
    const query = (this.searchInput?.value || "").trim();

    // If user starts editing text manually, invalidate hidden selection until they pick a match
    if (this.selectedStaff && query !== this.formatStaffDisplay(this.selectedStaff)) {
      this.selectedStaff = null;
      if (this.staffIdInput) this.staffIdInput.value = "";
      this.updateSelectedHint(null);
    }

    if (this.clearBtn) {
      this.clearBtn.style.display = query ? "inline-flex" : "none";
    }

    this.openDropdown(query);
  }

  openDropdown(rawQuery = "") {
    if (!this.resultsEl || !this.combobox) return;

    const query = String(rawQuery || "").trim().toLowerCase();
    const cleanNumeric = query.replace(/^#(stf-?)?/i, "");

    this.filteredStaff = !query
      ? [...this.staffList]
      : this.staffList.filter((staff) => {
          const paddedId = `stf-${String(staff.id).padStart(3, "0")}`;
          const hay = `${staff.id} ${paddedId} ${staff.full_name} ${staff.nic} ${staff.mobile} ${staff.status}`.toLowerCase();
          return hay.includes(query) || (cleanNumeric && String(staff.id) === cleanNumeric);
        });

    this.highlightedIndex = this.filteredStaff.length > 0 ? 0 : -1;
    this.isDropdownOpen = true;
    this.combobox.classList.add("open");
    this.searchInput?.setAttribute("aria-expanded", "true");
    this.renderDropdownResults();
    this.resultsEl.style.display = "block";
  }

  closeDropdown(restoreSelectedText = false) {
    if (!this.resultsEl || !this.combobox) return;

    this.isDropdownOpen = false;
    this.highlightedIndex = -1;
    this.combobox.classList.remove("open");
    this.searchInput?.setAttribute("aria-expanded", "false");
    this.resultsEl.style.display = "none";

    if (restoreSelectedText && this.searchInput) {
      this.searchInput.value = this.selectedStaff ? this.formatStaffDisplay(this.selectedStaff) : "";
      if (this.clearBtn) {
        this.clearBtn.style.display = this.selectedStaff ? "inline-flex" : "none";
      }
    }
  }

  renderDropdownResults() {
    if (!this.resultsEl) return;

    if (this.filteredStaff.length === 0) {
      this.resultsEl.innerHTML = `
        <div class="hr-combobox-empty">
          <i class="fa-solid fa-user-slash" style="margin-right: 6px;"></i>
          No matching staff members found.
        </div>
      `;
      return;
    }

    const selectedId = this.selectedStaff ? Number(this.selectedStaff.id) : null;

    this.resultsEl.innerHTML = this.filteredStaff
      .map((staff, idx) => {
        const paddedId = String(staff.id).padStart(3, "0");
        const isSelected = selectedId === Number(staff.id);
        const isHighlighted = idx === this.highlightedIndex;
        const itemClasses = [
          "hr-combobox-item",
          isSelected ? "selected" : "",
          isHighlighted ? "highlighted" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return `
          <div class="${itemClasses}" role="option" aria-selected="${isSelected}" data-staff-id="${staff.id}" data-index="${idx}">
            <div class="hr-combobox-item-main">
              <span class="hr-combobox-item-id">#STF-${this.escapeHtml(paddedId)}</span>
              <span class="hr-combobox-item-name">${this.escapeHtml(staff.full_name)}</span>
            </div>
            <span class="hr-combobox-item-meta">${this.escapeHtml(staff.nic)}</span>
          </div>
        `;
      })
      .join("");
  }

  moveHighlight(step) {
    if (this.filteredStaff.length === 0) return;

    const count = this.filteredStaff.length;
    this.highlightedIndex = (this.highlightedIndex + step + count) % count;
    this.renderDropdownResults();

    const activeEl = this.resultsEl?.querySelector(`.hr-combobox-item[data-index="${this.highlightedIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }

  selectHighlightedOrFirst() {
    if (this.filteredStaff.length === 0) return;
    const target = this.filteredStaff[this.highlightedIndex >= 0 ? this.highlightedIndex : 0];
    if (target) {
      this.selectStaff(target);
    }
  }

  selectStaff(staff) {
    if (!staff) return;

    this.selectedStaff = staff;

    if (this.staffIdInput) {
      this.staffIdInput.value = String(staff.id);
    }

    if (this.searchInput) {
      this.searchInput.value = this.formatStaffDisplay(staff);
    }

    if (this.clearBtn) {
      this.clearBtn.style.display = "inline-flex";
    }

    this.updateSelectedHint(staff);
    this.closeDropdown(false);
    this.amountInput?.focus();
  }

  clearSelection(reopenDropdown = false) {
    this.selectedStaff = null;

    if (this.staffIdInput) this.staffIdInput.value = "";
    if (this.searchInput) this.searchInput.value = "";
    if (this.clearBtn) this.clearBtn.style.display = "none";

    this.updateSelectedHint(null);

    if (reopenDropdown) {
      this.openDropdown("");
      this.searchInput?.focus();
    } else {
      this.closeDropdown(false);
    }
  }

  updateSelectedHint(staff) {
    if (!this.selectedHintEl) return;

    if (!staff) {
      this.selectedHintEl.innerHTML = "";
      this.selectedHintEl.style.display = "none";
      return;
    }

    const paddedId = String(staff.id || 0).padStart(3, "0");
    const nameParts = String(staff.full_name || "S").trim().split(/\s+/);
    const initials = `${nameParts[0]?.[0] || "S"}${nameParts[1]?.[0] || ""}`.toUpperCase();
    const statusLabel = staff.status || "Active";
    const statusLower = statusLabel.toLowerCase();
    const statusClass =
      statusLower === "active"
        ? "hr-tag-green"
        : statusLower === "on leave"
          ? "hr-tag-orange"
          : statusLower === "suspended" || statusLower === "resigned"
            ? "hr-tag-red"
            : "hr-tag-default";

    const hasSalary = staff.latest_salary !== null && staff.latest_salary !== undefined;
    const salaryValueHtml = hasSalary
      ? `<span class="hr-selected-salary-val set">Rs. ${Number(staff.latest_salary).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`
      : '<span class="hr-selected-salary-val unset">Not Set</span>';

    this.selectedHintEl.innerHTML = `
      <div class="hr-selected-staff-card">
        <div class="hr-selected-staff-top">
          <div class="hr-selected-staff-identity">
            <div class="hr-avatar purple">${this.escapeHtml(initials)}</div>
            <div>
              <div class="hr-selected-staff-name">${this.escapeHtml(staff.full_name || "Staff")}</div>
              <div class="hr-selected-staff-id">ID #STF-${this.escapeHtml(paddedId)}</div>
            </div>
          </div>
          <span class="hr-tag ${statusClass}"><span class="hr-dot"></span> ${this.escapeHtml(statusLabel)}</span>
        </div>
        <div class="hr-selected-staff-meta-grid">
          <div class="hr-selected-meta-item">
            <span class="hr-selected-meta-label"><i class="fa-solid fa-id-card"></i> NIC Number</span>
            <span class="hr-selected-meta-value hr-mono">${this.escapeHtml(staff.nic || "—")}</span>
          </div>
          <div class="hr-selected-meta-item">
            <span class="hr-selected-meta-label"><i class="fa-solid fa-phone"></i> Mobile Phone</span>
            <span class="hr-selected-meta-value">${this.escapeHtml(staff.mobile || "—")}</span>
          </div>
          <div class="hr-selected-meta-item full">
            <span class="hr-selected-meta-label"><i class="fa-solid fa-money-bill-wave"></i> Current Base Salary</span>
            ${salaryValueHtml}
          </div>
        </div>
      </div>
    `;
    this.selectedHintEl.style.display = "block";
  }

  /**
   * Update cached latest base salary for a staff member in the searchable combobox list.
   *
   * @param {number|string} staffId
   * @param {number} amount
   */
  updateStaffLatestSalary(staffId, amount) {
    const target = this.staffList.find((item) => Number(item.id) === Number(staffId));
    if (target) {
      target.latest_salary = parseFloat(amount);
    }
  }

  /**
   * Update cached employment status for a staff member in the searchable combobox list.
   *
   * @param {number|string} staffId
   * @param {string} statusLabel
   */
  updateStaffStatus(staffId, statusLabel) {
    const target = this.staffList.find((item) => Number(item.id) === Number(staffId));
    if (target) {
      target.status = statusLabel;
    }
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
    const amount = this.amountInput?.value || "";

    const originalBtnHtml = this.submitBtn
      ? this.submitBtn.innerHTML
      : '<i class="fa-solid fa-check"></i> Update Salary';

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating Salary...';
    }

    try {
      const result = await this.process.execute({
        staff_id: staffId,
        amount,
      });

      if (result.success && result.data) {
        this.updateStaffLatestSalary(result.data.staff_id, result.data.amount);
        this.close();
        if (this.form) this.form.reset();
        this.onSalaryUpdated(result.data, result.message);
      }
    } finally {
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = originalBtnHtml;
      }
    }
  }

  /**
   * Open Set Base Salary modal, optionally pre-selecting a staff member.
   *
   * @param {string|number|null} [staffId=null]
   */
  open(staffId = null) {
    if (!this.overlay) return;
    if (this.form) this.form.reset();

    this.clearError();
    this.clearSelection(false);

    if (staffId) {
      const match = this.staffList.find((s) => Number(s.id) === Number(staffId));
      if (match) {
        this.selectStaff(match);
      }
    }

    this.overlay.classList.add("open");

    if (staffId && this.amountInput) {
      this.amountInput.focus();
    } else if (this.searchInput) {
      this.searchInput.focus();
    }
  }

  close() {
    if (!this.overlay) return;
    this.closeDropdown(false);
    this.clearError();
    this.overlay.classList.remove("open");
  }
}

export default SetSalaryModal;
