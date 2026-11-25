/**
 * SanjeewaAdvertising - Supplier Card Builder
 *
 * Implements Builder Pattern to construct and render supplier directory cards
 * matching Customer Accounts Directory styling with colorful themed avatars,
 * metadata, stats row, and 2-line actionable shortcuts.
 */

export const SUPPLIER_CARD_THEMES = [
  {
    themeClass: "cust-theme-blue",
    avatar: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    bg: "#eff6ff",
    border: "#bfdbfe",
    glow: "rgba(59, 130, 246, 0.25)",
  },
  {
    themeClass: "cust-theme-green",
    avatar: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    glow: "rgba(16, 185, 129, 0.25)",
  },
  {
    themeClass: "cust-theme-purple",
    avatar: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    glow: "rgba(139, 92, 246, 0.25)",
  },
  {
    themeClass: "cust-theme-amber",
    avatar: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    bg: "#fffbeb",
    border: "#fde68a",
    glow: "rgba(245, 158, 11, 0.25)",
  },
  {
    themeClass: "cust-theme-pink",
    avatar: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    glow: "rgba(236, 72, 153, 0.25)",
  },
];

export class SupplierCardBuilder {
  /**
   * @param {Object} [data={}]
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.code = data.code || (data.id ? `SUP-${String(data.id).padStart(3, "0")}` : "SUP-001");
    this.name = data.name || "Supplier";
    this.contactPerson = data.contact_person || "";
    this.phone = data.phone || data.mobile || "—";
    this.altPhone = data.alt_phone || "";
    this.email = data.email || "";
    this.bankAccount = data.bank_account || data.bank_details || "";
    this.address = data.address || data.city || "Sri Lanka";
    this.category = data.category || "General Media";
    this.paymentTerms = data.payment_terms || "COD";
    this.status = data.status || "Active";
    this.approvedPoCount = Number(data.approvedPoCount ?? data.approved_purchase_orders_count ?? data.ungrnedPoCount ?? 0);
    this.ungrnedPoCount = this.approvedPoCount;
    this.pendingPayable = Number(data.pending_payable ?? data.pendingPayable ?? 0);
  }

  getInitials() {
    if (!this.name) return "SU";
    const parts = this.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.name.substring(0, 2).toUpperCase();
  }

  getCardTheme() {
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % SUPPLIER_CARD_THEMES.length;
    return SUPPLIER_CARD_THEMES[idx];
  }

  getBadgeStyle() {
    const cat = (this.category || "").toLowerCase();
    if (cat.includes("paper") || cat.includes("board")) {
      return "background: rgba(59, 130, 246, 0.14); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3);";
    }
    if (cat.includes("ink") || cat.includes("solvent")) {
      return "background: rgba(236, 72, 153, 0.14); color: #ec4899; border: 1px solid rgba(236, 72, 153, 0.3);";
    }
    if (cat.includes("flex") || cat.includes("banner")) {
      return "background: rgba(139, 92, 246, 0.14); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.3);";
    }
    if (cat.includes("vinyl") || cat.includes("sticker")) {
      return "background: rgba(16, 185, 129, 0.14); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);";
    }
    if (cat.includes("rigid") || cat.includes("hardware")) {
      return "background: rgba(245, 158, 11, 0.14); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);";
    }
    return "background: rgba(59, 130, 246, 0.14); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3);";
  }

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  render() {
    const initials = this.getInitials();
    const theme = this.getCardTheme();
    const badgeStyle = this.getBadgeStyle();
    const isDisabled = (this.status || "").toLowerCase() === "disabled";
    const safeName = this.escapeHtml(this.name);
    const safeCode = this.escapeHtml(this.code);
    const safePhone = this.escapeHtml(this.phone);
    const safeBankAccount = this.escapeHtml(this.bankAccount);
    const safeAddress = this.escapeHtml(this.address);
    const safeContact = this.escapeHtml(this.contactPerson);
    const safeCategory = this.escapeHtml(this.category);
    const safeTerms = this.escapeHtml(this.paymentTerms);
    const jsName = this.name.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    const jsCode = (this.code || (this.id ? `SUP-${String(this.id).padStart(3, "0")}` : "")).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    const payableAmount = Math.max(0, Number(this.pendingPayable || 0));
    const hasPayable = payableAmount > 0.009;
    const formattedPayable = payableAmount.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const payableColor = hasPayable ? "#dc2626" : "#059669";
    const grnPaymentsUrl = `/payments?view=grn-payment&supplier_id=${encodeURIComponent(this.id || "")}&search=${encodeURIComponent(this.name || "")}${hasPayable ? "&pending_only=1" : ""}`;

    return `
      <div class="customer-card-box supplier-card-box ${theme.themeClass || ''} ${isDisabled ? 'supplier-card-disabled' : ''}" data-supplier-code="${safeCode}" style="background: ${isDisabled ? 'rgba(239, 68, 68, 0.04)' : theme.bg}; border-color: ${isDisabled ? 'rgba(239, 68, 68, 0.35)' : theme.border};">
        <div class="cust-box-top">
          <div class="cust-avatar" style="background: ${isDisabled ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : theme.avatar}; box-shadow: 0 4px 12px ${isDisabled ? 'rgba(156, 163, 175, 0.2)' : theme.glow};">${initials}</div>
          <div class="cust-box-meta">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <strong>${safeName}</strong>
              <span class="grn-code-badge" style="background: var(--surface); color: var(--text-muted); border: 1px solid ${isDisabled ? 'rgba(239, 68, 68, 0.25)' : theme.border}; font-size: 10px; padding: 1px 6px;">${safeCode}</span>
              ${isDisabled ? `<span class="cust-item-badge supp-status-disabled-badge" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.25); font-size: 10px; padding: 1px 6px;"><i class="fa-solid fa-ban"></i> Disabled</span>` : ""}
            </div>
            ${safeContact && safeContact !== safeName ? `<span><i class="fa-solid fa-user-tie"></i> ${safeContact}</span>` : ""}
            <span><i class="fa-solid fa-phone"></i> ${safePhone}</span>
            ${safeBankAccount ? `<span><i class="fa-solid fa-building-columns"></i> ${safeBankAccount}</span>` : ""}
            <span><i class="fa-solid fa-location-dot"></i> ${safeAddress}</span>
          </div>
          <span class="cust-item-badge" style="${badgeStyle}" title="${safeCategory}">${safeCategory}</span>
        </div>
        <div class="cust-stats-row">
          <div class="cust-stat-item">
            <span>Approved POs</span>
            <strong style="${this.approvedPoCount > 0 ? 'color: #1677ff;' : ''}">
              <i class="fa-solid fa-clipboard-check" style="font-size: 11px; margin-right: 4px; ${this.approvedPoCount > 0 ? 'color: #1677ff;' : 'opacity: 0.6;'}"></i>${this.approvedPoCount} ${this.approvedPoCount === 1 ? 'PO' : 'POs'}
            </strong>
          </div>
          <a href="${grnPaymentsUrl}" class="cust-stat-item" title="View GRN payments for ${safeName}" style="text-decoration: none; cursor: pointer; display: flex; flex-direction: column;">
            <span style="display: inline-flex; align-items: center; gap: 4px;">
              Pending Payable
              ${hasPayable ? '<i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 9px; opacity: 0.75;"></i>' : ""}
            </span>
            <strong style="color: ${payableColor};">
              Rs. ${formattedPayable}
            </strong>
          </a>
        </div>
        <div class="cust-card-actions">
          <!-- Line 1: Primary Procurement Actions (+ PO and + GRN) -->
          <div class="supp-actions-row">
            <button type="button" class="ant-btn ant-btn-default supp-btn-action supp-btn-default" 
              ${isDisabled ? 'disabled style="opacity: 0.45; cursor: not-allowed;" title="Supplier is disabled"' : `title="Create Purchase Order for this Supplier" onclick="window.grnManager.openCreatePOModal('${jsName}')"`}>
              <i class="fa-solid fa-cart-arrow-down" style="color: ${isDisabled ? '#9ca3af' : '#1677ff'};"></i> + PO
            </button>
            <button type="button" class="ant-btn ant-btn-primary supp-btn-action supp-btn-primary" 
              ${isDisabled ? 'disabled style="opacity: 0.45; cursor: not-allowed;" title="Supplier is disabled"' : `title="Create GRN for this Supplier" onclick="window.grnManager.createGrnForSupplier('${jsName}')"`}>
              <i class="fa-solid fa-file-invoice"></i> + GRN
              ${this.approvedPoCount > 0 ? `<span class="supp-ungrned-pill">${this.approvedPoCount}</span>` : ""}
            </button>
          </div>

          <!-- Line 2: Management Actions (Edit Details and Toggle Status) -->
          <div class="supp-actions-row">
            <button type="button" class="supp-sub-btn" title="Edit Supplier Details" onclick="window.grnManager.openEditSupplierModal('${jsCode}')">
              <i class="fa-solid fa-pen-to-square"></i> Edit Details
            </button>
            <button type="button" class="supp-sub-btn ${isDisabled ? 'supp-sub-btn-success' : 'supp-sub-btn-danger'}" title="${isDisabled ? 'Enable Supplier' : 'Disable Supplier'}" onclick="window.grnManager.toggleSupplierStatus('${jsCode}')">
              <i class="fa-solid ${isDisabled ? 'fa-check' : 'fa-ban'}"></i> ${isDisabled ? 'Enable' : 'Disable'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

export default SupplierCardBuilder;
