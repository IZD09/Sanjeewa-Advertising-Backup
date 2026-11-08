/**
 * SanjeewaAdvertising - Customer Card Builder
 *
 * Implements Builder Pattern to construct and render customer account cards
 * with avatar initials, metadata, order statistics, and actionable shortcuts.
 */

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

  getAvatarGradient() {
    const gradients = [
      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
    ];
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % gradients.length;
    return gradients[idx];
  }

  getBadgeStyle() {
    if (this.badge === "VIP") {
      return "background: var(--green-subtle, #e6f7ef); color: var(--green, #10b981);";
    }
    if (this.badge === "Corporate") {
      return "background: var(--purple-subtle, #f3e8ff); color: var(--purple, #8b5cf6);";
    }
    return "background: var(--blue-subtle, #eff6ff); color: var(--blue, #3b82f6);";
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
    const avatarBg = this.getAvatarGradient();
    const badgeStyle = this.getBadgeStyle();
    const formattedSpent = Number(this.totalSpent || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return `
      <div class="customer-card-box" data-customer-id="${this.id || ""}">
        <div class="cust-box-top">
          <div class="cust-avatar" style="background: ${avatarBg};">${initials}</div>
          <div class="cust-box-meta">
            <strong>${this.name}</strong>
            <span><i class="fa-solid fa-phone"></i> ${this.mobile}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${this.location}</span>
          </div>
          <span class="cust-item-badge" style="${badgeStyle}">${this.badge}</span>
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

