/**
 * Stock & Inventory Management Module (Ant Design / Gravity UI Style)
 * Sanjeewa Advertising Digital Printing Shop Management System
 */

"use strict";

class InventoryManager {
  constructor() {
    this.storageKey = "sa_advertising_inventory_stock";
    this.items = [];
    this.filteredItems = [];
    this.searchTerm = "";
    this.selectedCategory = "ALL";
    this.currentContextItem = null;
    this.currentAdjustmentType = "ADD"; // "ADD" or "DEDUCT"

    this.init();
  }

  init() {
    this.loadData();
    this.bindEvents();
    this.render();

    // URL parameter support (?view=categories)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("view") === "categories") {
      this.openCategoriesModal();
    }
  }

  loadData() {
    const defaultSupplierMap = {
      "PAP-001": "PaperPro Lanka",
      "PAP-002": "PaperPro Lanka",
      "PAP-003": "PrintCare Materials",
      "INK-101": "Flora Tech International",
      "INK-102": "Flora Tech International",
      "INK-103": "Flora Tech International",
      "FLX-201": "MegaFlex Imports",
      "FLX-202": "Star Media Group",
      "VIN-301": "Avery Dennison Lanka",
      "VIN-303": "Avery Dennison Lanka",
      "RIG-401": "SignBoard Supplies",
      "RIG-402": "DisplayTech Hardware"
    };

    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.items = JSON.parse(saved);
        let updated = false;
        this.items.forEach(item => {
          if (!item.supplier) {
            item.supplier = defaultSupplierMap[item.code] || "General Supplier";
            updated = true;
          }
        });
        if (updated) this.saveData();
        return;
      } catch (e) {
        console.error("Could not parse saved inventory data, restoring defaults", e);
      }
    }
    this.seedDefaultInventory();
  }

  seedDefaultInventory() {
    this.items = [
      {
        code: "PAP-001",
        name: "300gsm Art Board SRA3",
        category: "Paper & Boards",
        supplier: "PaperPro Lanka",
        unitPrice: 45.00,
        unit: "Sheets",
        minThreshold: 500,
        batches: [
          { id: "BAT-101", receivedDate: "2026-09-10", unitCost: 40.00, initialQty: 2500, availableQty: 1200, supplier: "PaperPro Lanka" },
          { id: "BAT-102", receivedDate: "2026-10-15", unitCost: 42.00, initialQty: 1500, availableQty: 1500, supplier: "PaperPro Lanka" }
        ],
        transactions: [
          { id: "TXN-01", date: "2026-10-24 14:15", type: "DEDUCT", batchId: "BAT-101", qty: 350, reason: "Used for Job ORD-2026-1048", operator: "Admin User", remarks: "Brochure printing assignment" },
          { id: "TXN-02", date: "2026-10-15 10:00", type: "ADD", batchId: "BAT-102", qty: 1500, reason: "Supplier Stock Consignment", operator: "Kasun Perera", remarks: "Delivery from PaperPro Lanka" }
        ]
      },
      {
        code: "PAP-002",
        name: "250gsm Ivory Board A3",
        category: "Paper & Boards",
        supplier: "PaperPro Lanka",
        unitPrice: 38.00,
        unit: "Sheets",
        minThreshold: 400,
        batches: [
          { id: "BAT-103", receivedDate: "2026-08-20", unitCost: 34.00, initialQty: 1000, availableQty: 280, supplier: "PaperPro Lanka" }
        ],
        transactions: [
          { id: "TXN-03", date: "2026-10-22 11:30", type: "DEDUCT", batchId: "BAT-103", qty: 150, reason: "Used for Job ORD-2026-1049", operator: "Nuwan Silva", remarks: "Certificate printing" }
        ]
      },
      {
        code: "PAP-003",
        name: "150gsm Glossy Art Paper A4",
        category: "Paper & Boards",
        supplier: "PrintCare Materials",
        unitPrice: 14.00,
        unit: "Sheets",
        minThreshold: 800,
        batches: [
          { id: "BAT-104", receivedDate: "2026-09-01", unitCost: 11.50, initialQty: 5000, availableQty: 4200, supplier: "PrintCare Materials" }
        ],
        transactions: [
          { id: "TXN-04", date: "2026-10-21 16:00", type: "DEDUCT", batchId: "BAT-104", qty: 800, reason: "Used for Leaflet Batch #2", operator: "Dilshan Fernando", remarks: "A5 flyers" }
        ]
      },
      {
        code: "INK-101",
        name: "Flora Solvent Cyan Ink (5L)",
        category: "Inks & Toners",
        supplier: "Flora Tech International",
        unitPrice: 6800.00,
        unit: "Liters",
        minThreshold: 10,
        batches: [
          { id: "BAT-201", receivedDate: "2026-09-18", unitCost: 6100.00, initialQty: 25, availableQty: 18, supplier: "Flora Tech International" }
        ],
        transactions: [
          { id: "TXN-05", date: "2026-10-23 09:10", type: "DEDUCT", batchId: "BAT-201", qty: 5, reason: "Machine Refill (Flora Large Format)", operator: "Chamara Bandara", remarks: "Daily print tank replenishment" }
        ]
      },
      {
        code: "INK-102",
        name: "Flora Solvent Magenta Ink (5L)",
        category: "Inks & Toners",
        supplier: "Flora Tech International",
        unitPrice: 6800.00,
        unit: "Liters",
        minThreshold: 10,
        batches: [
          { id: "BAT-202", receivedDate: "2026-09-18", unitCost: 6100.00, initialQty: 25, availableQty: 8, supplier: "Flora Tech International" }
        ],
        transactions: [
          { id: "TXN-06", date: "2026-10-25 15:20", type: "DEDUCT", batchId: "BAT-202", qty: 6, reason: "Machine Refill (Flora Large Format)", operator: "Chamara Bandara", remarks: "Refill before overnight run" }
        ]
      },
      {
        code: "INK-103",
        name: "Flora Solvent Yellow Ink (5L)",
        category: "Inks & Toners",
        supplier: "Flora Tech International",
        unitPrice: 6800.00,
        unit: "Liters",
        minThreshold: 10,
        batches: [
          { id: "BAT-203", receivedDate: "2026-09-18", unitCost: 6100.00, initialQty: 20, availableQty: 0, supplier: "Flora Tech International" }
        ],
        transactions: [
          { id: "TXN-07", date: "2026-10-25 18:00", type: "DEDUCT", batchId: "BAT-203", qty: 4, reason: "Used for Job ORD-2026-1050", operator: "Nuwan Silva", remarks: "Tank fully consumed; reorder needed immediately" }
        ]
      },
      {
        code: "FLX-201",
        name: "Frontlit Flex 280gsm (10ft × 50m)",
        category: "Flex & Banners",
        supplier: "MegaFlex Imports",
        unitPrice: 18500.00,
        unit: "Rolls",
        minThreshold: 4,
        batches: [
          { id: "BAT-301", receivedDate: "2026-09-25", unitCost: 16200.00, initialQty: 10, availableQty: 6, supplier: "MegaFlex Imports" }
        ],
        transactions: [
          { id: "TXN-08", date: "2026-10-20 12:45", type: "DEDUCT", batchId: "BAT-301", qty: 2, reason: "Loaded into Flora #1 Machine", operator: "Kasun Perera", remarks: "Outdoor hoarding printing" }
        ]
      },
      {
        code: "FLX-202",
        name: "Star Heavy Flex 380gsm (10.5ft × 50m)",
        category: "Flex & Banners",
        supplier: "Star Media Group",
        unitPrice: 26000.00,
        unit: "Rolls",
        minThreshold: 3,
        batches: [
          { id: "BAT-302", receivedDate: "2026-10-02", unitCost: 23500.00, initialQty: 6, availableQty: 2, supplier: "Star Media Group" }
        ],
        transactions: [
          { id: "TXN-09", date: "2026-10-22 14:00", type: "DEDUCT", batchId: "BAT-302", qty: 1, reason: "Used for VIP Project", operator: "Admin User", remarks: "Heavy weather signage" }
        ]
      },
      {
        code: "VIN-301",
        name: "Glossy Self-Adhesive Vinyl (4ft × 50m)",
        category: "Vinyl & Stickers",
        supplier: "Avery Dennison Lanka",
        unitPrice: 16800.00,
        unit: "Rolls",
        minThreshold: 5,
        batches: [
          { id: "BAT-401", receivedDate: "2026-09-12", unitCost: 14800.00, initialQty: 12, availableQty: 8, supplier: "Avery Dennison Lanka" }
        ],
        transactions: [
          { id: "TXN-10", date: "2026-10-24 16:30", type: "DEDUCT", batchId: "BAT-401", qty: 1, reason: "Used for Vehicle Branding Job", operator: "Nuwan Silva", remarks: "Van wrap print" }
        ]
      },
      {
        code: "VIN-303",
        name: "One-Way Vision Film (4.2ft × 30m)",
        category: "Vinyl & Stickers",
        supplier: "Avery Dennison Lanka",
        unitPrice: 21500.00,
        unit: "Rolls",
        minThreshold: 3,
        batches: [
          { id: "BAT-402", receivedDate: "2026-08-30", unitCost: 19000.00, initialQty: 5, availableQty: 1, supplier: "Avery Dennison Lanka" }
        ],
        transactions: [
          { id: "TXN-11", date: "2026-10-18 10:15", type: "DEDUCT", batchId: "BAT-402", qty: 1, reason: "Storefront Glass Graphics", operator: "Dilshan Fernando", remarks: "Showroom window graphics" }
        ]
      },
      {
        code: "RIG-401",
        name: "5mm White Foam Board (4ft × 8ft)",
        category: "Rigid Boards & Hardware",
        supplier: "SignBoard Supplies",
        unitPrice: 3400.00,
        unit: "Sheets",
        minThreshold: 15,
        batches: [
          { id: "BAT-501", receivedDate: "2026-10-05", unitCost: 2950.00, initialQty: 50, availableQty: 32, supplier: "SignBoard Supplies" }
        ],
        transactions: [
          { id: "TXN-12", date: "2026-10-23 13:00", type: "DEDUCT", batchId: "BAT-501", qty: 8, reason: "Exhibition Stand Displays", operator: "Chamara Bandara", remarks: "Mounted promo boards" }
        ]
      },
      {
        code: "RIG-402",
        name: "Rollup Stand Luxury Aluminium (2.5ft × 6ft)",
        category: "Rigid Boards & Hardware",
        supplier: "DisplayTech Hardware",
        unitPrice: 2800.00,
        unit: "Sets",
        minThreshold: 8,
        batches: [
          { id: "BAT-502", receivedDate: "2026-09-20", unitCost: 2350.00, initialQty: 30, availableQty: 14, supplier: "DisplayTech Hardware" }
        ],
        transactions: [
          { id: "TXN-13", date: "2026-10-24 17:00", type: "DEDUCT", batchId: "BAT-502", qty: 4, reason: "Corporate Event Rollups", operator: "Kasun Perera", remarks: "Complete stand assemblies" }
        ]
      }
    ];
    this.saveData();
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  getItemAvailableQty(item) {
    if (!item.batches || item.batches.length === 0) return 0;
    return item.batches.reduce((sum, b) => sum + (parseFloat(b.availableQty) || 0), 0);
  }

  getItemTotalValue(item) {
    const qty = this.getItemAvailableQty(item);
    return qty * (item.unitPrice || 0);
  }

  getItemStatus(item) {
    const qty = this.getItemAvailableQty(item);
    if (qty <= 0) {
      return { label: "Out of Stock", class: "ant-tag-red", icon: "fa-circle-xmark" };
    }
    if (qty <= (item.minThreshold || 0)) {
      return { label: "Low Stock", class: "ant-tag-yellow", icon: "fa-triangle-exclamation" };
    }
    return { label: "In Stock", class: "ant-tag-green", icon: "fa-circle-check" };
  }

  formatCurrency(amount) {
    return `Rs. ${(parseFloat(amount) || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById("invSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.trim().toLowerCase();
        this.renderTable();
      });
    }

    // Category filter
    const categoryFilter = document.getElementById("invCategoryFilter");
    if (categoryFilter) {
      categoryFilter.addEventListener("change", (e) => {
        this.selectedCategory = e.target.value;
        this.renderTable();
      });
    }

    // Export button
    const exportBtn = document.getElementById("invExportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportCSV());
    }

    // Modal Close buttons
    document.querySelectorAll("[data-close-inv-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-close-inv-modal");
        this.closeModal(modalId);
      });
    });

    // Close modal on clicking backdrop outside modal content
    document.querySelectorAll(".po-modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("open");
        }
      });
    });

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".po-modal-overlay.open").forEach(modal => {
          modal.classList.remove("open");
        });
      }
    });

    // Adjustment modal segmented options toggle
    const addOption = document.getElementById("adjTypeAdd");
    const deductOption = document.getElementById("adjTypeDeduct");
    if (addOption && deductOption) {
      addOption.addEventListener("click", () => this.setAdjustmentType("ADD"));
      deductOption.addEventListener("click", () => this.setAdjustmentType("DEDUCT"));
    }

    // Adjustment quantity input live calculation
    const adjQtyInput = document.getElementById("adjQtyInput");
    const adjBatchSelect = document.getElementById("adjBatchSelect");
    if (adjQtyInput) {
      adjQtyInput.addEventListener("input", () => this.updateAdjustmentImpact());
    }
    if (adjBatchSelect) {
      adjBatchSelect.addEventListener("change", () => this.updateAdjustmentImpact());
    }

    // Save Adjustment button
    const saveAdjBtn = document.getElementById("saveStockAdjustmentBtn");
    if (saveAdjBtn) {
      saveAdjBtn.addEventListener("click", () => this.saveStockAdjustment());
    }

    // Add Stock button
    const addStockBtn = document.getElementById("invAddStockBtn");
    if (addStockBtn) {
      addStockBtn.addEventListener("click", () => this.openAddStockModal());
    }

    // Add Stock item selection change
    const addStockItemSelect = document.getElementById("addStockItemSelect");
    if (addStockItemSelect) {
      addStockItemSelect.addEventListener("change", () => this.handleItemSelectionChange());
    }

    // Add Stock financial live calculations
    const addStockQty = document.getElementById("addStockQty");
    const addStockUnitCost = document.getElementById("addStockUnitCost");
    const addStockSellingPrice = document.getElementById("addStockSellingPrice");

    if (addStockQty) addStockQty.addEventListener("input", () => this.updateAddStockFinancials());
    if (addStockUnitCost) addStockUnitCost.addEventListener("input", () => this.updateAddStockFinancials());
    if (addStockSellingPrice) addStockSellingPrice.addEventListener("input", () => this.updateAddStockFinancials());

    // Save Stock Shipment button
    const saveNewStockBtn = document.getElementById("saveNewStockBtn");
    if (saveNewStockBtn) {
      saveNewStockBtn.addEventListener("click", () => this.saveNewStock());
    }

    // Categories button in header
    const invCategoriesBtn = document.getElementById("invCategoriesBtn");
    if (invCategoriesBtn) {
      invCategoriesBtn.addEventListener("click", () => this.openCategoriesModal());
    }

    // Suppliers button in header - links to GRN Suppliers Directory UI
    const invSuppliersBtn = document.getElementById("invSuppliersBtn");
    if (invSuppliersBtn) {
      invSuppliersBtn.addEventListener("click", () => {
        window.location.href = "/grn?view=suppliers";
      });
    }

    // New Category Form toggle
    const openNewCategoryFormBtn = document.getElementById("openNewCategoryFormBtn");
    const cancelNewCategoryBtn = document.getElementById("cancelNewCategoryBtn");
    const saveNewCategoryBtn = document.getElementById("saveNewCategoryBtn");
    const newCategoryFormWrap = document.getElementById("newCategoryFormWrap");

    if (openNewCategoryFormBtn && newCategoryFormWrap) {
      openNewCategoryFormBtn.addEventListener("click", () => {
        newCategoryFormWrap.style.display = "block";
      });
    }

    if (cancelNewCategoryBtn && newCategoryFormWrap) {
      cancelNewCategoryBtn.addEventListener("click", () => {
        newCategoryFormWrap.style.display = "none";
      });
    }

    if (saveNewCategoryBtn) {
      saveNewCategoryBtn.addEventListener("click", () => this.saveNewCategory());
    }
  }

  getCategoryIcon(catName) {
    const map = {
      "Paper & Boards": "fa-scroll",
      "Inks & Toners": "fa-fill-drip",
      "Flex & Banners": "fa-flag",
      "Vinyl & Stickers": "fa-note-sticky",
      "Rigid Boards & Hardware": "fa-hammer"
    };
    return map[catName] || "fa-tags";
  }

  openCategoriesModal() {
    this.renderCategoriesGrid();
    this.openModal("invCategoriesModal");
  }

  renderCategoriesGrid() {
    const container = document.getElementById("categoriesGridContainer");
    if (!container) return;

    // Collect all unique categories
    const categoriesMap = {};
    const defaultCategories = [
      "Paper & Boards",
      "Inks & Toners",
      "Flex & Banners",
      "Vinyl & Stickers",
      "Rigid Boards & Hardware"
    ];

    defaultCategories.forEach(cat => {
      categoriesMap[cat] = { name: cat, itemsCount: 0, totalVal: 0, totalQty: 0 };
    });

    this.items.forEach(item => {
      const cat = item.category || "Uncategorized";
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { name: cat, itemsCount: 0, totalVal: 0, totalQty: 0 };
      }
      categoriesMap[cat].itemsCount++;
      const qty = this.getItemAvailableQty(item);
      categoriesMap[cat].totalQty += qty;
      categoriesMap[cat].totalVal += (qty * (item.unitPrice || 0));
    });

    container.innerHTML = "";
    Object.values(categoriesMap).forEach(cat => {
      const icon = this.getCategoryIcon(cat.name);
      const card = document.createElement("div");
      card.className = "inv-kpi-card";
      card.style.cursor = "default";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.justifyContent = "space-between";
      card.style.border = "1px solid var(--border)";
      card.style.borderRadius = "8px";
      card.style.padding = "14px";
      card.style.background = "var(--surface-2)";
      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(22, 119, 255, 0.12); color: #1677ff; display: flex; align-items: center; justify-content: center; font-size: 16px;">
              <i class="fa-solid ${icon}"></i>
            </div>
            <span class="ant-tag ant-tag-blue" style="margin: 0; font-size: 11px;">${cat.itemsCount} ${cat.itemsCount === 1 ? "SKU" : "SKUs"}</span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: var(--text);">${cat.name}</h4>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">Total Valuation: <strong style="color: #52c41a;">${this.formatCurrency(cat.totalVal)}</strong></div>
        </div>
        <div style="margin-top: 10px; border-top: 1px solid var(--border); padding-top: 10px;">
          <button type="button" class="ant-btn ant-btn-default" style="font-size: 11.5px; padding: 4px 10px; width: 100%;" onclick="window.inventoryManager.filterByCategoryFromModal('${cat.name.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-filter"></i> View Stock Items
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  filterByCategoryFromModal(categoryName) {
    this.selectedCategory = categoryName;
    const catSelect = document.getElementById("invCategoryFilter");
    if (catSelect) {
      let found = false;
      for (let i = 0; i < catSelect.options.length; i++) {
        if (catSelect.options[i].value === categoryName) {
          catSelect.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        const opt = document.createElement("option");
        opt.value = categoryName;
        opt.textContent = categoryName;
        catSelect.appendChild(opt);
        catSelect.value = categoryName;
      }
    }
    this.closeModal("invCategoriesModal");
    this.renderTable();
    this.showToast(`Filtered stock items by category: ${categoryName}`, "info");
  }

  saveNewCategory() {
    const nameInput = document.getElementById("newCatName");
    const descInput = document.getElementById("newCatDesc");
    const name = nameInput ? nameInput.value.trim() : "";

    if (!name) {
      this.showToast("Please enter a category name.", "error");
      return;
    }

    // Add to filter dropdown if not existing
    const catSelect = document.getElementById("invCategoryFilter");
    if (catSelect) {
      let exists = false;
      for (let i = 0; i < catSelect.options.length; i++) {
        if (catSelect.options[i].value.toLowerCase() === name.toLowerCase()) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        catSelect.appendChild(opt);
      }
    }

    if (nameInput) nameInput.value = "";
    if (descInput) descInput.value = "";
    const wrap = document.getElementById("newCategoryFormWrap");
    if (wrap) wrap.style.display = "none";

    this.showToast(`New category '${name}' created successfully!`, "success");
    this.renderCategoriesGrid();
  }

  render() {
    this.renderKPIs();
    this.renderTable();
  }

  renderKPIs() {
    const totalItems = this.items.length;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    this.items.forEach(item => {
      const qty = this.getItemAvailableQty(item);
      totalStockValue += (qty * item.unitPrice);
      if (qty <= 0) {
        outOfStockCount++;
      } else if (qty <= (item.minThreshold || 0)) {
        lowStockCount++;
      }
    });

    const kpiTotalItems = document.getElementById("invKpiTotalItems");
    const kpiTotalValue = document.getElementById("invKpiTotalValue");
    const kpiLowStock = document.getElementById("invKpiLowStock");
    const kpiOutOfStock = document.getElementById("invKpiOutOfStock");

    if (kpiTotalItems) kpiTotalItems.textContent = totalItems;
    if (kpiTotalValue) kpiTotalValue.textContent = this.formatCurrency(totalStockValue);
    if (kpiLowStock) kpiLowStock.textContent = lowStockCount;
    if (kpiOutOfStock) kpiOutOfStock.textContent = outOfStockCount;
  }

  renderTable() {
    const tbody = document.getElementById("invTableBody");
    const countLabel = document.getElementById("invTableCount");
    if (!tbody) return;

    // Filter items
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = !this.searchTerm ||
        item.code.toLowerCase().includes(this.searchTerm) ||
        item.name.toLowerCase().includes(this.searchTerm) ||
        item.category.toLowerCase().includes(this.searchTerm) ||
        (item.supplier && item.supplier.toLowerCase().includes(this.searchTerm));

      const matchesCat = this.selectedCategory === "ALL" || item.category === this.selectedCategory;

      return matchesSearch && matchesCat;
    });

    if (countLabel) {
      countLabel.textContent = `Showing ${this.filteredItems.length} of ${this.items.length} materials`;
    }

    tbody.innerHTML = "";

    if (this.filteredItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10">
            <div class="inv-empty-state">
              <i class="fa-solid fa-box-open"></i>
              <h4 style="margin: 0; font-size: 14px; color: var(--text);">No matching materials found</h4>
              <p style="margin: 4px 0 0; font-size: 12px; color: var(--text-muted);">Try adjusting your search criteria or category filter</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    this.filteredItems.forEach(item => {
      const availQty = this.getItemAvailableQty(item);
      const totalVal = availQty * item.unitPrice;
      const status = this.getItemStatus(item);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="inv-item-code">${item.code}</span></td>
        <td>
          <div class="inv-item-title">${item.name}</div>
        </td>
        <td><span class="inv-cat-pill"><i class="fa-solid fa-tag"></i> ${item.category}</span></td>
        <td><span class="inv-supplier-pill"><i class="fa-solid fa-truck-field"></i> ${item.supplier || "PaperPro Lanka"}</span></td>
        <td class="text-right">${this.formatCurrency(item.unitPrice)}</td>
        <td class="text-right">
          <strong>${availQty.toLocaleString()}</strong>
        </td>
        <td><span class="inv-unit-badge">${item.unit}</span></td>
        <td class="text-right" style="font-weight: 700; color: var(--text);">
          ${this.formatCurrency(totalVal)}
        </td>
        <td>
          <span class="ant-tag ${status.class}">
            <span class="ant-tag-dot"></span>
            ${status.label}
          </span>
        </td>
        <td class="text-center">
          <div class="inv-actions-group">
            <button class="ant-btn-action" title="View Details" onclick="window.inventoryManager.openViewModal('${item.code}')">
              <i class="fa-solid fa-eye"></i> View
            </button>
            <button class="ant-btn-action adjust-btn" title="Adjust Stock" onclick="window.inventoryManager.openAdjustModal('${item.code}')">
              <i class="fa-solid fa-sliders"></i> Adjust
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* ==========================================================================
     VIEW DETAILS MODAL
     ========================================================================== */
  openViewModal(itemCode) {
    const item = this.items.find(i => i.code === itemCode);
    if (!item) return;

    this.currentContextItem = item;
    const availQty = this.getItemAvailableQty(item);
    const totalVal = availQty * item.unitPrice;

    // Set Modal Titles
    const titleElem = document.getElementById("invViewModalTitle");
    if (titleElem) {
      titleElem.innerHTML = `<i class="fa-solid fa-boxes-stacked" style="color: #1677ff;"></i> ${item.name} <span class="inv-item-code" style="margin-left: 8px;">${item.code}</span> <span class="inv-supplier-pill" style="margin-left: 8px;"><i class="fa-solid fa-truck-field"></i> ${item.supplier || "Standard Supplier"}</span>`;
    }

    // Top Section Highlight Cards
    const totalQtyElem = document.getElementById("invViewTotalQty");
    const totalValElem = document.getElementById("invViewTotalVal");
    if (totalQtyElem) totalQtyElem.textContent = `${availQty.toLocaleString()} ${item.unit}`;
    if (totalValElem) totalValElem.textContent = this.formatCurrency(totalVal);

    // Middle Section: Batch Breakdown Table
    const batchTbody = document.getElementById("invViewBatchTbody");
    if (batchTbody) {
      batchTbody.innerHTML = "";
      if (!item.batches || item.batches.length === 0) {
        batchTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 14px;">No batch records available</td></tr>`;
      } else {
        item.batches.forEach(b => {
          const batchVal = (parseFloat(b.availableQty) || 0) * (parseFloat(b.unitCost) || 0);
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong style="color: #1677ff;">${b.id}</strong></td>
            <td>${b.receivedDate}</td>
            <td class="text-right">${this.formatCurrency(b.unitCost)}</td>
            <td class="text-right">${b.initialQty.toLocaleString()}</td>
            <td class="text-right"><strong>${b.availableQty.toLocaleString()}</strong></td>
            <td class="text-right" style="font-weight: 700;">${this.formatCurrency(batchVal)}</td>
          `;
          batchTbody.appendChild(tr);
        });
      }
    }

    // Bottom Section: Recent Transactions Timeline
    const timelineElem = document.getElementById("invViewTimeline");
    if (timelineElem) {
      timelineElem.innerHTML = "";
      if (!item.transactions || item.transactions.length === 0) {
        timelineElem.innerHTML = `<div style="color: var(--text-muted); font-size: 12px; padding: 10px 0;">No stock transaction history recorded yet.</div>`;
      } else {
        item.transactions.slice(0, 8).forEach(tx => {
          const isAdd = tx.type === "ADD";
          const itemDiv = document.createElement("div");
          itemDiv.className = "inv-timeline-item";
          itemDiv.innerHTML = `
            <span class="inv-timeline-dot ${isAdd ? "add" : "deduct"}"></span>
            <div class="inv-timeline-content">
              <div class="inv-timeline-main">
                <span class="ant-tag ${isAdd ? "ant-tag-green" : "ant-tag-red"}" style="padding: 1px 7px; font-size: 10.5px; margin-right: 6px;">
                  ${isAdd ? "(+) ADDED" : "(-) DEDUCTED"} ${tx.qty} ${item.unit}
                </span>
                <strong>Batch: ${tx.batchId}</strong> &bull; <span style="color: var(--text);">${tx.reason}</span>
                <p>${tx.remarks || "No additional remarks"} &bull; <span style="font-size: 11px; color: var(--text-muted);">Recorded by ${tx.operator || "Admin"}</span></p>
              </div>
              <div class="inv-timeline-date">${tx.date}</div>
            </div>
          `;
          timelineElem.appendChild(itemDiv);
        });
      }
    }

    this.openModal("viewStockDetailsModal");
  }

  /* ==========================================================================
     STOCK ADJUSTMENT MODAL
     ========================================================================== */
  openAdjustModal(itemCode) {
    const item = this.items.find(i => i.code === itemCode);
    if (!item) return;

    this.currentContextItem = item;
    this.currentAdjustmentType = "ADD";

    // Set Modal Title
    const titleElem = document.getElementById("invAdjustModalTitle");
    if (titleElem) {
      titleElem.innerHTML = `<i class="fa-solid fa-sliders" style="color: #faad14;"></i> Adjust Stock — ${item.name} <span class="inv-item-code" style="margin-left: 8px;">${item.code}</span>`;
    }

    // Populate Batch Dropdown
    const batchSelect = document.getElementById("adjBatchSelect");
    if (batchSelect) {
      batchSelect.innerHTML = "";
      if (item.batches && item.batches.length > 0) {
        item.batches.forEach(b => {
          const opt = document.createElement("option");
          opt.value = b.id;
          opt.textContent = `${b.id} — Available: ${b.availableQty} ${item.unit} (Unit Cost: ${this.formatCurrency(b.unitCost)})`;
          batchSelect.appendChild(opt);
        });
      } else {
        batchSelect.innerHTML = `<option value="">No existing batches available</option>`;
      }
    }

    // Reset Form Fields
    this.setAdjustmentType("ADD");
    const qtyInput = document.getElementById("adjQtyInput");
    if (qtyInput) qtyInput.value = "";
    const reasonSelect = document.getElementById("adjReasonSelect");
    if (reasonSelect) reasonSelect.selectedIndex = 0;
    const remarksInput = document.getElementById("adjRemarksInput");
    if (remarksInput) remarksInput.value = "";

    this.updateAdjustmentImpact();
    this.openModal("adjustStockModal");
  }

  setAdjustmentType(type) {
    this.currentAdjustmentType = type;
    const addBtn = document.getElementById("adjTypeAdd");
    const deductBtn = document.getElementById("adjTypeDeduct");

    if (addBtn && deductBtn) {
      if (type === "ADD") {
        addBtn.className = "inv-segmented-option active add";
        deductBtn.className = "inv-segmented-option";
      } else {
        addBtn.className = "inv-segmented-option";
        deductBtn.className = "inv-segmented-option active deduct";
      }
    }
    this.updateAdjustmentImpact();
  }

  updateAdjustmentImpact() {
    if (!this.currentContextItem) return;

    const batchSelect = document.getElementById("adjBatchSelect");
    const qtyInput = document.getElementById("adjQtyInput");
    const impactElem = document.getElementById("adjImpactValue");
    if (!impactElem) return;

    const selectedBatchId = batchSelect?.value;
    const batch = this.currentContextItem.batches?.find(b => b.id === selectedBatchId);
    const unitCost = batch ? (parseFloat(batch.unitCost) || 0) : (this.currentContextItem.unitPrice || 0);
    const qty = parseFloat(qtyInput?.value) || 0;
    const totalImpact = qty * unitCost;

    const prefix = this.currentAdjustmentType === "ADD" ? "(+) " : "(-) ";
    const color = this.currentAdjustmentType === "ADD" ? "#52c41a" : "#ff4d4f";

    impactElem.innerHTML = `<span style="color: ${color}; font-weight: 800;">${prefix}${this.formatCurrency(totalImpact)}</span> <span style="font-size: 11px; color: var(--text-muted);">(${qty} × ${this.formatCurrency(unitCost)})</span>`;
  }

  saveStockAdjustment() {
    if (!this.currentContextItem) return;

    const batchSelect = document.getElementById("adjBatchSelect");
    const qtyInput = document.getElementById("adjQtyInput");
    const reasonSelect = document.getElementById("adjReasonSelect");
    const remarksInput = document.getElementById("adjRemarksInput");

    const batchId = batchSelect?.value;
    const qty = parseFloat(qtyInput?.value);
    const reason = reasonSelect?.value;
    const remarks = remarksInput?.value?.trim() || "";

    if (!batchId) {
      this.showToast("Please select a batch for this adjustment", "error");
      return;
    }

    if (!qty || qty <= 0) {
      this.showToast("Please enter a valid positive adjustment quantity", "error");
      return;
    }

    const batch = this.currentContextItem.batches?.find(b => b.id === batchId);
    if (!batch) {
      this.showToast("Selected batch could not be found", "error");
      return;
    }

    // If deducting, check if there's enough available stock
    if (this.currentAdjustmentType === "DEDUCT") {
      if (qty > batch.availableQty) {
        this.showToast(`Cannot deduct ${qty} ${this.currentContextItem.unit}. Batch ${batchId} only has ${batch.availableQty} available.`, "error");
        return;
      }
      batch.availableQty -= qty;
    } else {
      batch.availableQty += qty;
    }

    // Record Transaction Entry
    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);
    const txnId = `TXN-${Date.now().toString().slice(-4)}`;

    if (!this.currentContextItem.transactions) {
      this.currentContextItem.transactions = [];
    }

    this.currentContextItem.transactions.unshift({
      id: txnId,
      date: dateStr,
      type: this.currentAdjustmentType,
      batchId: batchId,
      qty: qty,
      reason: reason,
      operator: "Admin User",
      remarks: remarks
    });

    this.saveData();
    this.closeModal("adjustStockModal");
    this.render();

    const actionText = this.currentAdjustmentType === "ADD" ? "added to" : "deducted from";
    this.showToast(`Successfully ${actionText} ${this.currentContextItem.code} (${qty} ${this.currentContextItem.unit})!`, "success");
  }

  /* ==========================================================================
     ADD / RECEIVE STOCK SHIPMENT MODAL
     ========================================================================== */
  openAddStockModal(prefillItemCode = null) {
    const itemSelect = document.getElementById("addStockItemSelect");
    if (!itemSelect) return;

    itemSelect.innerHTML = "";
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "-- Select Material SKU from Catalog --";
    itemSelect.appendChild(defaultOpt);

    this.items.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.code;
      opt.textContent = `${item.code} — ${item.name} (${item.category})`;
      if (prefillItemCode && item.code === prefillItemCode) {
        opt.selected = true;
      }
      itemSelect.appendChild(opt);
    });

    const newOpt = document.createElement("option");
    newOpt.value = "__NEW_SKU__";
    newOpt.textContent = "+ [Register New Material SKU]";
    itemSelect.appendChild(newOpt);

    // Reset Form Fields
    const batchInput = document.getElementById("addStockBatchId");
    if (batchInput) {
      batchInput.value = `BAT-${Math.floor(100 + Math.random() * 900)}`;
    }

    const dateInput = document.getElementById("addStockDate");
    if (dateInput) {
      dateInput.value = new Date().toISOString().split("T")[0];
    }

    const qtyInput = document.getElementById("addStockQty");
    if (qtyInput) qtyInput.value = "";

    const unitCostInput = document.getElementById("addStockUnitCost");
    if (unitCostInput) unitCostInput.value = "";

    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    if (sellingPriceInput) sellingPriceInput.value = "";

    const invRefInput = document.getElementById("addStockInvoiceRef");
    if (invRefInput) invRefInput.value = "";

    const remarksInput = document.getElementById("addStockRemarks");
    if (remarksInput) remarksInput.value = "";

    const newCodeInput = document.getElementById("newSkuCode");
    if (newCodeInput) newCodeInput.value = "";

    const newNameInput = document.getElementById("newSkuName");
    if (newNameInput) newNameInput.value = "";

    this.handleItemSelectionChange();
    this.openModal("addStockModal");
  }

  handleItemSelectionChange() {
    const itemSelect = document.getElementById("addStockItemSelect");
    const newSkuSection = document.getElementById("newSkuDetailsSection");
    const supplierInput = document.getElementById("addStockSupplier");
    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    const unitCostInput = document.getElementById("addStockUnitCost");
    const unitLabel = document.getElementById("addStockUnitLabel");

    const val = itemSelect?.value;
    if (val === "__NEW_SKU__") {
      if (newSkuSection) newSkuSection.style.display = "block";
      if (unitLabel) unitLabel.textContent = "Units";
    } else {
      if (newSkuSection) newSkuSection.style.display = "none";
      const item = this.items.find(i => i.code === val);
      if (item) {
        if (supplierInput) supplierInput.value = item.supplier || "";
        if (sellingPriceInput) sellingPriceInput.value = item.unitPrice || "";
        if (unitLabel) unitLabel.textContent = item.unit || "Units";
        // Pre-fill unit cost from latest batch if available
        if (unitCostInput && item.batches && item.batches.length > 0) {
          const lastBatch = item.batches[item.batches.length - 1];
          unitCostInput.value = lastBatch.unitCost || "";
        }
      }
    }
    this.updateAddStockFinancials();
  }

  updateAddStockFinancials() {
    const qtyInput = document.getElementById("addStockQty");
    const unitCostInput = document.getElementById("addStockUnitCost");
    const sellingPriceInput = document.getElementById("addStockSellingPrice");

    const totalCostElem = document.getElementById("addStockTotalCost");
    const totalValElem = document.getElementById("addStockTotalValue");

    const qty = parseFloat(qtyInput?.value) || 0;
    const unitCost = parseFloat(unitCostInput?.value) || 0;
    const sellingPrice = parseFloat(sellingPriceInput?.value) || 0;

    const totalCost = qty * unitCost;
    const totalVal = qty * sellingPrice;

    if (totalCostElem) totalCostElem.textContent = this.formatCurrency(totalCost);
    if (totalValElem) totalValElem.textContent = this.formatCurrency(totalVal);
  }

  saveNewStock() {
    const itemSelect = document.getElementById("addStockItemSelect");
    const supplierInput = document.getElementById("addStockSupplier");
    const batchInput = document.getElementById("addStockBatchId");
    const dateInput = document.getElementById("addStockDate");
    const qtyInput = document.getElementById("addStockQty");
    const unitCostInput = document.getElementById("addStockUnitCost");
    const sellingPriceInput = document.getElementById("addStockSellingPrice");
    const invoiceRefInput = document.getElementById("addStockInvoiceRef");
    const remarksInput = document.getElementById("addStockRemarks");

    const val = itemSelect?.value;
    const supplier = supplierInput?.value?.trim();
    const batchId = batchInput?.value?.trim() || `BAT-${Date.now().toString().slice(-4)}`;
    const receivedDate = dateInput?.value || new Date().toISOString().split("T")[0];
    const qty = parseFloat(qtyInput?.value);
    const unitCost = parseFloat(unitCostInput?.value) || 0;
    const sellingPrice = parseFloat(sellingPriceInput?.value) || 0;
    const invoiceRef = invoiceRefInput?.value?.trim() || "";
    const remarks = remarksInput?.value?.trim() || "";

    if (!val) {
      this.showToast("Please select a material or choose to register a new SKU", "error");
      return;
    }

    if (!supplier) {
      this.showToast("Please specify a supplier / vendor for this shipment", "error");
      return;
    }

    if (!qty || qty <= 0) {
      this.showToast("Please enter a valid received quantity greater than 0", "error");
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().replace("T", " ").substring(0, 16);
    const txnId = `TXN-${Date.now().toString().slice(-4)}`;
    const operator = "Admin User";

    if (val === "__NEW_SKU__") {
      const codeInput = document.getElementById("newSkuCode");
      const nameInput = document.getElementById("newSkuName");
      const catSelect = document.getElementById("newSkuCategory");
      const unitSelect = document.getElementById("newSkuUnit");

      const code = codeInput?.value?.trim().toUpperCase();
      const name = nameInput?.value?.trim();
      const category = catSelect?.value || "Paper & Boards";
      const unit = unitSelect?.value || "Units";

      if (!code || !name) {
        this.showToast("Please provide both an Item Code and Item Name for the new SKU", "error");
        return;
      }

      if (this.items.some(i => i.code.toUpperCase() === code)) {
        this.showToast(`An item with code "${code}" already exists in the catalog!`, "error");
        return;
      }

      const newItem = {
        code: code,
        name: name,
        category: category,
        supplier: supplier,
        unitPrice: sellingPrice > 0 ? sellingPrice : unitCost * 1.25,
        unit: unit,
        minThreshold: Math.max(5, Math.floor(qty * 0.2)),
        batches: [
          {
            id: batchId,
            receivedDate: receivedDate,
            unitCost: unitCost,
            initialQty: qty,
            availableQty: qty,
            supplier: supplier
          }
        ],
        transactions: [
          {
            id: txnId,
            date: dateStr,
            type: "ADD",
            batchId: batchId,
            qty: qty,
            reason: `Initial Consignment received from ${supplier}`,
            operator: operator,
            remarks: remarks || (invoiceRef ? `Invoice: ${invoiceRef}` : "New material catalog entry")
          }
        ]
      };

      this.items.unshift(newItem);
      this.saveData();
      this.closeModal("addStockModal");
      this.render();
      this.showToast(`Successfully registered new SKU ${code} and added ${qty} ${unit} to stock!`, "success");
    } else {
      const item = this.items.find(i => i.code === val);
      if (!item) {
        this.showToast("Selected item could not be found", "error");
        return;
      }

      // Update supplier and unitPrice
      item.supplier = supplier;
      if (sellingPrice > 0) {
        item.unitPrice = sellingPrice;
      }

      if (!item.batches) item.batches = [];
      item.batches.push({
        id: batchId,
        receivedDate: receivedDate,
        unitCost: unitCost,
        initialQty: qty,
        availableQty: qty,
        supplier: supplier
      });

      if (!item.transactions) item.transactions = [];
      item.transactions.unshift({
        id: txnId,
        date: dateStr,
        type: "ADD",
        batchId: batchId,
        qty: qty,
        reason: `Shipment received from ${supplier}`,
        operator: operator,
        remarks: remarks || (invoiceRef ? `Invoice: ${invoiceRef}` : "Consignment delivery")
      });

      this.saveData();
      this.closeModal("addStockModal");
      this.render();
      this.showToast(`Successfully added ${qty} ${item.unit} to ${item.code} (${item.name}) from ${supplier}!`, "success");
    }
  }

  /* ==========================================================================
     CSV EXPORT
     ========================================================================== */
  exportCSV() {
    if (!this.items || this.items.length === 0) {
      this.showToast("No inventory records available to export", "warning");
      return;
    }

    const headers = ["Item Code", "Item Name", "Category", "Supplier", "Unit Price (LKR)", "Available Qty", "Unit", "Total Stock Value (LKR)", "Status"];
    const rows = this.items.map(item => {
      const availQty = this.getItemAvailableQty(item);
      const totalVal = availQty * item.unitPrice;
      const status = this.getItemStatus(item);
      return [
        `"${item.code}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category}"`,
        `"${(item.supplier || 'Standard Supplier').replace(/"/g, '""')}"`,
        item.unitPrice.toFixed(2),
        availQty,
        `"${item.unit}"`,
        totalVal.toFixed(2),
        `"${status.label}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Sanjeewa_Stock_Inventory_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    this.showToast("Stock Inventory CSV exported successfully!", "success");
  }

  /* Modal Helpers */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("open");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
  }

  showToast(message, type = "success") {
    const container = document.getElementById("poToastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `po-toast ${type}`;

    let icon = "fa-check-circle";
    if (type === "error") icon = "fa-triangle-exclamation";
    if (type === "warning") icon = "fa-circle-exclamation";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 260);
    }, 3500);
  }
}

// Global initialization
if (typeof window !== "undefined") {
  window.InventoryManager = InventoryManager;
  document.addEventListener("DOMContentLoaded", () => {
    window.inventoryManager = new InventoryManager();
  });
}
