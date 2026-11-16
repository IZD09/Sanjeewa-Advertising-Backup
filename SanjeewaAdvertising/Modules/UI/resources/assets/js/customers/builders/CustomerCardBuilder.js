/**
 * SanjeewaAdvertising - Customer Card Builder
 *
 * Implements Builder Pattern to construct and render customer account cards
 * with avatar initials, metadata, order statistics, and actionable shortcuts.
 */

const CUSTOMER_CARD_THEMES = [
  {
    themeClass: "cust-theme-blue",
    avatar: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    themeClass: "cust-theme-green",
    avatar: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  {
    themeClass: "cust-theme-purple",
    avatar: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    themeClass: "cust-theme-amber",
    avatar: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    themeClass: "cust-theme-pink",
    avatar: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    bg: "#fdf2f8",
    border: "#fbcfe8",
  },
];

export class CustomerCardBuilder {
  /**
   * @param {Object} [data={}]
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "Customer";
    this.mobile = data.mobile || "—";
    this.email = data.email || "";
    this.location = data.address || data.city || data.location || (data.email ? data.email.split("@")[0] : "Colombo");
    this.badge = data.badge || data.category || (data.print_jobs_count > 10 ? "VIP" : (data.print_jobs_count > 5 ? "Corporate" : "Regular"));
    this.totalOrders = data.print_jobs_count ?? data.totalOrders ?? 0;
    this.totalSpent = data.totalSpent ?? (this.totalOrders * 8500);
    this.newOrderUrl = data.newOrderUrl || "/place-order";
  }

  setId(id) {
    this.id = id;
    return this;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setMobile(mobile) {
    this.mobile = mobile;
    return this;
  }

  setLocation(location) {
    this.location = location;
    return this;
  }

  setBadge(badge) {
    this.badge = badge;
    return this;
  }

  setTotalOrders(count) {
    this.totalOrders = count;
    return this;
  }

  setTotalSpent(amount) {
    this.totalSpent = amount;
    return this;
  }

  setNewOrderUrl(url) {
    this.newOrderUrl = url;
    return this;
  }

  getInitials() {
    if (!this.name) return "CU";
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
    const idx = Math.abs(hash) % CUSTOMER_CARD_THEMES.length;
    return CUSTOMER_CARD_THEMES[idx];
  }

  getAvatarGradient() {
    return this.getCardTheme().avatar;
  }

  getBadgeClass() {
    if (this.badge === "VIP") return "badge-vip";
    if (this.badge === "Corporate") return "badge-corporate";
    return "badge-regular";
  }

  getBadgeStyle() {
    if (this.badge === "VIP") {
      return "background: rgba(16, 185, 129, 0.14); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.28);";
    }
    if (this.badge === "Corporate") {
      return "background: rgba(139, 92, 246, 0.14); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.28);";
    }
    return "background: rgba(59, 130, 246, 0.14); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.28);";
  }

  build() {
    return this;
  }

  /**
   * Render card HTML matching exact design template.
   * @returns {string}
   */
  render() {
    const initials = this.getInitials();
    const theme = this.getCardTheme();
    const badgeStyle = this.getBadgeStyle();
    const badgeClass = this.getBadgeClass();
    const formattedSpent = Number(this.totalSpent || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return `
      <div class="customer-card-box ${theme.themeClass || ""}" data-customer-id="${this.id || ""}" style="background: ${theme.bg}; border-color: ${theme.border};">
        <div class="cust-box-top">
          <div class="cust-avatar" style="background: ${theme.avatar};">${initials}</div>
          <div class="cust-box-meta">
            <strong>${this.name}</strong>
            <span><i class="fa-solid fa-phone"></i> ${this.mobile}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${this.location}</span>
          </div>
          <span class="cust-item-badge ${badgeClass}" style="${badgeStyle}">${this.badge}</span>
        </div>
        <div class="cust-stats-row">
          <div class="cust-stat-item"><span>Total Orders</span><strong>${this.totalOrders} Orders</strong></div>
          <div class="cust-stat-item"><span>Total Spent</span><strong>Rs. ${formattedSpent}</strong></div>
        </div>
        <div class="cust-card-actions">
          <a href="${this.newOrderUrl}" class="po-btn po-btn-secondary" style="height: 32px; font-size: 11px;">
            <i class="fa-solid fa-cart-plus"></i> New Order
          </a>
        </div>
      </div>
    `;
  }
}

export default CustomerCardBuilder;

