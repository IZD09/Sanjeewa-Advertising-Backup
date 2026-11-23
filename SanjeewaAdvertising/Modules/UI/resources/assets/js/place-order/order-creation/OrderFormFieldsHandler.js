/**
 * SanjeewaAdvertising - Order Form Fields Handler
 * Encapsulates reading, populating, clearing, and edit-mode UI state
 * for the order-level fields inside #createOrderModal.
 */

export class OrderFormFieldsHandler {
  /**
   * @param {Object} [options={}]
   * @param {Function} [options.getDefaultDeadline]
   */
  constructor(options = {}) {
    this.getDefaultDeadline = options.getDefaultDeadline || (() => {
      return new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
    });
  }

  /**
   * Read all order-item field values from the DOM.
   *
   * @returns {Object}
   */
  readFields() {
    const printingTypeEl = document.getElementById("poPrintingType");
    const userEl = document.getElementById("poUser");
    const designStatusEl = document.getElementById("poDesignStatus");
    const notesEl = document.getElementById("poNotes");
    const widthEl = document.getElementById("poWidth");
    const heightEl = document.getElementById("poHeight");
    const unitEl = document.getElementById("poUnit");
    const qtyEl = document.getElementById("poQty");
    const unitPriceEl = document.getElementById("poUnitPrice");
    const discountEl = document.getElementById("poDiscount");
    const deliveryMethodEl = document.getElementById("poDeliveryMethod");
    const requiredDateEl = document.getElementById("poRequiredDate");

    const unitOption = unitEl?.selectedOptions?.[0];

    return {
      printingTypeId: printingTypeEl?.value || "",
      printingTypeName: printingTypeEl?.selectedOptions?.[0]?.textContent?.trim() || "",
      userId: userEl?.value || "",
      userName: userEl?.selectedOptions?.[0]?.textContent?.trim() || "",
      designStatus: designStatusEl?.value || "Customer Provides Design",
      notes: notesEl?.value?.trim() || "",
      width: parseFloat(widthEl?.value),
      height: parseFloat(heightEl?.value),
      unitId: unitEl?.value || "",
      unitSymbol: unitOption?.getAttribute("data-symbol") || "ft",
      unitName: unitOption?.textContent?.trim() || "Feet (ft)",
      qty: parseInt(qtyEl?.value, 10),
      unitPriceRaw: unitPriceEl?.value ?? "",
      unitPrice: parseFloat(unitPriceEl?.value),
      discount: parseFloat(discountEl?.value) || 0,
      deliveryMethodId: deliveryMethodEl?.value || "",
      deliveryMethodName: deliveryMethodEl?.selectedOptions?.[0]?.textContent?.trim() || "",
      requiredDate: requiredDateEl?.value || "",
    };
  }

  /**
   * Load an OrderItemModel's values back into the form inputs for editing.
   *
   * @param {import('./OrderItemModel.js').OrderItemModel} item
   */
  populateFields(item) {
    if (!item) return;

    this.setSelectValue("poPrintingType", item.printingTypeId);
    this.setSelectValue("poUser", item.userId);
    this.setSelectValue("poDesignStatus", item.designStatus);
    this.setInputValue("poNotes", item.notes || "");

    this.setInputValue("poWidth", item.width);
    this.setInputValue("poHeight", item.height);
    this.setSelectValue("poUnit", item.unitId);
    this.setInputValue("poQty", item.qty);
    this.setInputValue("poUnitPrice", item.unitPrice);
    this.setInputValue("poDiscount", Number(item.discount || 0).toFixed(2));
    this.setSelectValue("poDeliveryMethod", item.deliveryMethodId);
    this.setInputValue("poRequiredDate", item.requiredDate || this.getDefaultDeadline());
  }

  /**
   * Clear ONLY the order-related input fields so the user can add another order
   * under the same customer.
   */
  clearFields() {
    this.resetSelectToFirst("poPrintingType");
    this.resetSelectToFirst("poUser");
    this.setSelectValue("poDesignStatus", "Customer Provides Design");
    this.setInputValue("poNotes", "");

    this.setInputValue("poWidth", "1");
    this.setInputValue("poHeight", "1");
    this.resetUnitToDefault();
    this.setInputValue("poQty", "1");
    this.setInputValue("poUnitPrice", "0");
    this.setInputValue("poDiscount", "0.00");
    this.resetSelectToFirst("poDeliveryMethod");
    this.setInputValue("poRequiredDate", this.getDefaultDeadline());
  }

  /**
   * Update the live item calculation badges in Section 2.
   *
   * @param {Object} calc
   */
  updateLiveItemPreview(calc) {
    if (!calc) return;

    const areaValElem = document.getElementById("liveAreaVal");
    const designFeeElem = document.getElementById("liveDesignFeeNotice");
    const itemTotalElem = document.getElementById("liveOrderItemTotal");

    if (areaValElem) {
      if (calc.isPieceUnit) {
        areaValElem.textContent = `${calc.qty} pcs`;
      } else {
        areaValElem.textContent = `${calc.areaSqFt.toFixed(2)} sq.ft (${(calc.areaSqFt * calc.qty).toFixed(2)} total)`;
      }
    }

    if (designFeeElem) {
      designFeeElem.style.display = calc.designFee > 0 ? "block" : "none";
    }

    if (itemTotalElem) {
      const fmtOpts = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
      itemTotalElem.textContent = `Rs. ${calc.totalAmount.toLocaleString("en-LK", fmtOpts)}`;
    }
  }

  /**
   * Toggle the Add Order / Update Order button and editing indicator badge.
   *
   * @param {boolean} isEditing
   * @param {number|null} [rowNumber=null]
   */
  setEditMode(isEditing, rowNumber = null) {
    const addBtn = document.getElementById("addOrderItemBtn");
    const cancelBtn = document.getElementById("cancelEditOrderItemBtn");
    const editBadge = document.getElementById("editingOrderBadge");

    if (addBtn) {
      if (isEditing) {
        addBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Update Order';
        addBtn.classList.add("po-btn-update");
        addBtn.classList.remove("po-btn-primary");
      } else {
        addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Order';
        addBtn.classList.remove("po-btn-update");
        addBtn.classList.add("po-btn-primary");
      }
    }

    if (cancelBtn) {
      cancelBtn.style.display = isEditing ? "inline-flex" : "none";
    }

    if (editBadge) {
      if (isEditing && rowNumber) {
        editBadge.innerHTML = `<i class="fa-solid fa-pen"></i> Editing Order #${rowNumber}`;
        editBadge.style.display = "inline-flex";
      } else {
        editBadge.style.display = "none";
      }
    }
  }

  /**
   * Focus a specific input element by ID.
   *
   * @param {string} id
   */
  focusField(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el && typeof el.focus === "function") {
      el.focus();
    }
  }

  /**
   * @private
   */
  setInputValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.value = value ?? "";
    }
  }

  /**
   * @private
   */
  setSelectValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const strVal = String(value ?? "");
    const hasOption = Array.from(el.options).some((opt) => String(opt.value) === strVal);
    if (hasOption) {
      el.value = strVal;
    }
  }

  /**
   * @private
   */
  resetSelectToFirst(id) {
    const el = document.getElementById(id);
    if (el && el.options.length > 0) {
      el.selectedIndex = 0;
    }
  }

  /**
   * @private
   */
  resetUnitToDefault() {
    const unitEl = document.getElementById("poUnit");
    if (!unitEl || unitEl.options.length === 0) return;

    const ftOption = Array.from(unitEl.options).find(
      (opt) => (opt.getAttribute("data-symbol") || "").toLowerCase() === "ft"
    );
    if (ftOption) {
      unitEl.value = ftOption.value;
    } else {
      unitEl.selectedIndex = 0;
    }
  }
}

export default OrderFormFieldsHandler;
