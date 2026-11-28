/**
 * PrintJobMaterialModal - Handles Raw Stock & Materials Allocation (E-Commerce Shopping Cart Experience)
 */
export class PrintJobMaterialModal {
    constructor(dataLoader, options = {}) {
        this.dataLoader = dataLoader;
        this.onJobUpdated = options.onJobUpdated || (() => {});
        this.onStartPrintingSuccess = options.onStartPrintingSuccess || null;
        this.showToast = options.showToast || ((msg, type) => alert(msg));
        this.modal = document.getElementById('modalAllocateMaterial');
        this.currentJob = null;
        this.cart = [];
        this.isCartDirty = false;
        this.isSavingCart = false;
        this.availableStocks = [];
        this.categories = [];
        this.subcategories = [];
        this.statuses = [];
        this.forStartPrinting = false;
        this.selectedCategoryId = '';
        this.selectedSubcategoryId = '';
        this.searchQuery = '';

        this.initEvents();
    }

    initEvents() {
        // Add to Cart button
        const btnAdd = document.getElementById('btnSubmitAssignMaterial');
        if (btnAdd) {
            btnAdd.onclick = () => this.addToCart();
        }

        // Selector Qty Minus / Plus stepper buttons & Unit Selector
        const btnMinus = document.getElementById('btnSelectorQtyMinus');
        const btnPlus = document.getElementById('btnSelectorQtyPlus');
        const inputQty = document.getElementById('inputMaterialQty');
        const unitSelect = document.getElementById('selectMaterialQtyUnit');

        if (btnMinus && inputQty) {
            btnMinus.onclick = () => {
                const factor = this.getSelectedUnitFactor();
                const step = factor < 1 ? (factor === 0.01 ? 10 : 50) : (parseFloat(inputQty.value) <= 1 ? 0.1 : 1);
                const minVal = factor < 1 ? 1 : 0.1;
                const current = parseFloat(inputQty.value) || (factor < 1 ? 100 : 1);
                inputQty.value = String(this.roundQty(Math.max(minVal, current - step)));
                this.updateUnitConversionHint();
            };
        }

        if (btnPlus && inputQty) {
            btnPlus.onclick = () => {
                const factor = this.getSelectedUnitFactor();
                const step = factor < 1 ? (factor === 0.01 ? 10 : 50) : (parseFloat(inputQty.value) < 1 ? 0.1 : 1);
                const current = parseFloat(inputQty.value) || 0;
                const max = parseFloat(inputQty.max) || 999999;
                inputQty.value = String(this.roundQty(Math.min(max, current + step)));
                this.updateUnitConversionHint();
            };
        }

        if (inputQty) {
            inputQty.oninput = () => this.updateUnitConversionHint();
        }

        if (unitSelect) {
            unitSelect.onchange = () => {
                this.syncQtyInputLimitsForUnit();
                this.updateUnitConversionHint();
            };
        }

        // Clear Cart button
        const btnClearCart = document.getElementById('btnClearMaterialCart');
        if (btnClearCart) {
            btnClearCart.onclick = () => this.clearCart();
        }

        // Save Cart button
        const btnSaveCart = document.getElementById('btnSaveMaterialCart');
        if (btnSaveCart) {
            btnSaveCart.onclick = () => this.saveCart({ closeOnSuccess: true });
        }

        // Save Cart & Start Printing button
        const btnStart = document.getElementById('btnModalStartPrinting');
        if (btnStart) {
            btnStart.onclick = () => this.submitStartPrinting();
        }

        // 1. Category selector change
        const catSelect = document.getElementById('selectMaterialCategory');
        if (catSelect) {
            catSelect.onchange = () => {
                this.selectedCategoryId = catSelect.value ? String(catSelect.value) : '';
                this.selectedSubcategoryId = '';
                this.updateSubcategoryDropdown();
                this.filterAndRenderStockOptions();
            };
        }

        // 2. Subcategory selector change
        const subcatSelect = document.getElementById('selectMaterialSubcategory');
        if (subcatSelect) {
            subcatSelect.onchange = () => {
                this.selectedSubcategoryId = subcatSelect.value ? String(subcatSelect.value) : '';

                // If subcategory picked and category not selected, auto-select its category
                if (this.selectedSubcategoryId && !this.selectedCategoryId) {
                    const sc = this.subcategories.find(s => String(s.id) === this.selectedSubcategoryId);
                    if (sc && sc.category_id) {
                        this.selectedCategoryId = String(sc.category_id);
                        if (catSelect) catSelect.value = this.selectedCategoryId;
                    }
                }

                this.filterAndRenderStockOptions();
            };
        }

        // 3. Live search filter input
        const filterInput = document.getElementById('inputMaterialFilter');
        if (filterInput) {
            filterInput.oninput = () => {
                this.searchQuery = filterInput.value.trim().toLowerCase();
                this.filterAndRenderStockOptions();
            };
        }

        // 4. Material dropdown selection preview change
        const selectStock = document.getElementById('selectAllocateStock');
        if (selectStock) {
            selectStock.onchange = () => this.updateStockPreview(true);
        }
    }

    roundQty(val) {
        const num = parseFloat(val);
        if (isNaN(num)) return 0;
        return Number(num.toFixed(3));
    }

    getUnitConversionOptions(rawUnit, rawUnitName = '') {
        const combined = `${rawUnit || ''} ${rawUnitName || ''}`.trim().toLowerCase();
        if (/\b(l|ltr|liter|liters|litre|litres)\b/.test(combined) && !/\bml\b/.test(combined)) {
            return {
                baseSymbol: rawUnit || 'L',
                options: [
                    { label: rawUnit || 'L', factor: 1 },
                    { label: 'ml', factor: 0.001 }
                ]
            };
        }
        if (/\b(kg|kilogram|kilograms)\b/.test(combined)) {
            return {
                baseSymbol: rawUnit || 'kg',
                options: [
                    { label: rawUnit || 'kg', factor: 1 },
                    { label: 'g', factor: 0.001 }
                ]
            };
        }
        if (/\b(m|meter|meters|metre|metres)\b/.test(combined) && !/\b(cm|mm|sqm)\b/.test(combined)) {
            return {
                baseSymbol: rawUnit || 'm',
                options: [
                    { label: rawUnit || 'm', factor: 1 },
                    { label: 'cm', factor: 0.01 }
                ]
            };
        }
        return null;
    }

    getSelectedUnitFactor() {
        const unitSelect = document.getElementById('selectMaterialQtyUnit');
        if (!unitSelect || unitSelect.style.display === 'none') return 1;
        const opt = unitSelect.selectedOptions ? unitSelect.selectedOptions[0] : null;
        return opt ? (parseFloat(opt.getAttribute('data-factor')) || 1) : 1;
    }

    syncQtyInputLimitsForUnit() {
        const select = document.getElementById('selectAllocateStock');
        const inputQty = document.getElementById('inputMaterialQty');
        if (!select || !inputQty) return;

        const stockId = parseInt(select.value, 10);
        const stock = this.availableStocks.find(s => Number(s.id) === stockId);
        const availBaseQty = stock ? this.roundQty(stock.qty) : 999999;
        const factor = this.getSelectedUnitFactor();

        if (availBaseQty > 0) {
            inputQty.max = String(this.roundQty(availBaseQty / factor));
        }
        inputQty.min = factor < 1 ? '1' : '0.001';
    }

    updateUnitConversionHint() {
        const badge = document.getElementById('previewConvertedQtyBadge');
        const unitSelect = document.getElementById('selectMaterialQtyUnit');
        const inputQty = document.getElementById('inputMaterialQty');
        if (!badge) return;

        const factor = this.getSelectedUnitFactor();
        if (!unitSelect || unitSelect.style.display === 'none' || factor === 1 || !inputQty) {
            badge.style.display = 'none';
            return;
        }

        const rawVal = parseFloat(inputQty.value) || 0;
        const baseSymbol = unitSelect.getAttribute('data-base-unit') || 'Units';
        const subSymbol = unitSelect.selectedOptions?.[0]?.value || '';
        const converted = this.roundQty(rawVal * factor);

        if (rawVal > 0) {
            badge.textContent = `${this.roundQty(rawVal)} ${subSymbol} = ${converted} ${baseSymbol}`;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    setReferenceData(stocks = [], categories = [], subcategories = []) {
        this.availableStocks = stocks || [];
        this.categories = categories || [];
        this.subcategories = subcategories || [];

        if (this.categories.length === 0 && this.availableStocks.length > 0) {
            const catMap = new Map();
            this.availableStocks.forEach(s => {
                if (s.category_id && s.category) {
                    catMap.set(String(s.category_id), { id: s.category_id, name: s.category });
                }
            });
            this.categories = Array.from(catMap.values());
        }

        if (this.subcategories.length === 0 && this.availableStocks.length > 0) {
            const subMap = new Map();
            this.availableStocks.forEach(s => {
                if (s.subcategory_id && s.subcategory) {
                    subMap.set(String(s.subcategory_id), {
                        id: s.subcategory_id,
                        category_id: s.category_id,
                        name: s.subcategory
                    });
                }
            });
            this.subcategories = Array.from(subMap.values());
        }

        if (!this.modal || !this.modal.classList.contains('active')) {
            this.populateCategoryDropdown();
            this.updateSubcategoryDropdown();
            this.filterAndRenderStockOptions();
        }
    }

    setAvailableStocks(stocks = []) {
        this.availableStocks = stocks || [];
        if (!this.modal || !this.modal.classList.contains('active')) {
            this.filterAndRenderStockOptions();
        }
    }

    populateCategoryDropdown() {
        const catSelect = document.getElementById('selectMaterialCategory');
        if (!catSelect) return;

        const currentVal = this.selectedCategoryId;
        catSelect.innerHTML = '<option value="">-- All Categories --</option>' +
            this.categories.map(c => `
                <option value="${c.id}" ${String(c.id) === String(currentVal) ? 'selected' : ''}>
                    ${this.escapeHtml(c.name)}
                </option>
            `).join('');
    }

    updateSubcategoryDropdown() {
        const subcatSelect = document.getElementById('selectMaterialSubcategory');
        if (!subcatSelect) return;

        let filteredSubcats = this.subcategories || [];
        if (this.selectedCategoryId) {
            filteredSubcats = filteredSubcats.filter(sc => String(sc.category_id) === this.selectedCategoryId);
        }

        subcatSelect.innerHTML = '<option value="">-- All Subcategories --</option>' +
            filteredSubcats.map(sc => `
                <option value="${sc.id}" data-category-id="${sc.category_id || ''}" ${String(sc.id) === String(this.selectedSubcategoryId) ? 'selected' : ''}>
                    ${this.escapeHtml(sc.name)}
                </option>
            `).join('');

        subcatSelect.value = this.selectedSubcategoryId || '';
    }

    filterAndRenderStockOptions() {
        const select = document.getElementById('selectAllocateStock');
        if (!select) return;

        let filtered = this.availableStocks || [];

        // 1. Filter by Category
        if (this.selectedCategoryId) {
            filtered = filtered.filter(s => {
                if (s.category_id) {
                    return String(s.category_id) === this.selectedCategoryId;
                }
                const catObj = this.categories.find(c => String(c.id) === this.selectedCategoryId);
                return catObj && String(s.category || '').toLowerCase() === String(catObj.name || '').toLowerCase();
            });
        }

        // 2. Filter by Subcategory
        if (this.selectedSubcategoryId) {
            filtered = filtered.filter(s => {
                if (s.subcategory_id) {
                    return String(s.subcategory_id) === this.selectedSubcategoryId;
                }
                const subObj = this.subcategories.find(sc => String(sc.id) === this.selectedSubcategoryId);
                return subObj && String(s.subcategory || '').toLowerCase() === String(subObj.name || '').toLowerCase();
            });
        }

        // 3. Filter by Search Query
        if (this.searchQuery) {
            filtered = filtered.filter(s => {
                const combined = `${s.name || ''} ${s.code || ''} ${s.brand || ''} ${s.category || ''} ${s.subcategory || ''}`.toLowerCase();
                return combined.includes(this.searchQuery);
            });
        }

        select.innerHTML = '<option value="">-- Choose Stock Item --</option>' +
            filtered.map(s => {
                const codePart = s.code ? `[${this.escapeHtml(s.code)}] ` : '';
                const brandPart = s.brand ? ` (${this.escapeHtml(s.brand)})` : '';
                const catPart = s.category ? ` • ${this.escapeHtml(s.category)}` : '';
                const unitLabel = s.unit && s.unit !== 'Units' ? ` ${this.escapeHtml(s.unit)}` : '';
                const availQty = this.roundQty(s.qty);
                const inCartItem = this.cart.find(c => Number(c.stock_id) === Number(s.id));
                const cartTag = inCartItem ? ` [Selected: ${this.roundQty(inCartItem.qty)}${unitLabel}]` : '';
                return `
                    <option value="${s.id}" data-code="${this.escapeHtml(s.code || '')}" data-brand="${this.escapeHtml(s.brand || '')}" data-category="${this.escapeHtml(s.category || '')}" data-subcategory="${this.escapeHtml(s.subcategory || '')}" data-qty="${availQty}" data-unit="${this.escapeHtml(s.unit || '')}">
                        ${codePart}${this.escapeHtml(s.name)}${brandPart}${catPart} — Avail: ${availQty}${unitLabel}${cartTag}
                    </option>
                `;
            }).join('');

        this.updateStockPreview(false);
    }

    updateStockPreview(resetUnitSelector = false) {
        const select = document.getElementById('selectAllocateStock');
        const preview = document.getElementById('allocStockItemPreview');
        const inputQty = document.getElementById('inputMaterialQty');
        const unitSelect = document.getElementById('selectMaterialQtyUnit');
        if (!select || !preview) return;

        const opt = select.selectedOptions ? select.selectedOptions[0] : null;
        if (!opt || !opt.value) {
            preview.style.display = 'none';
            if (unitSelect) {
                unitSelect.style.display = 'none';
                unitSelect.innerHTML = '';
            }
            this.updateUnitConversionHint();
            return;
        }

        const stockId = parseInt(opt.value, 10);
        const stock = this.availableStocks.find(s => Number(s.id) === stockId);
        const cartItem = this.cart.find(c => Number(c.stock_id) === stockId);

        const codeEl = document.getElementById('previewStockCode');
        const brandEl = document.getElementById('previewStockBrand');
        const catEl = document.getElementById('previewStockCategory');
        const qtyEl = document.getElementById('previewStockQty');
        const inCartBadge = document.getElementById('previewInCartBadge');

        if (codeEl) codeEl.textContent = stock?.code || opt.getAttribute('data-code') || '—';
        if (brandEl) brandEl.textContent = stock?.brand || opt.getAttribute('data-brand') || 'Generic';

        const catName = stock?.category || opt.getAttribute('data-category') || '';
        const subcatName = stock?.subcategory || opt.getAttribute('data-subcategory') || '';
        if (catEl) {
            catEl.textContent = [catName, subcatName].filter(Boolean).join(' / ') || 'General';
        }

        const unitSymbol = stock?.unit || opt.getAttribute('data-unit') || '';
        const displayUnit = unitSymbol && unitSymbol !== 'Units' ? ` ${unitSymbol}` : '';
        const availQty = this.roundQty(stock ? stock.qty : (parseFloat(opt.getAttribute('data-qty')) || 0));
        if (qtyEl) qtyEl.textContent = `${availQty}${displayUnit} in stock`;

        if (unitSelect && (resetUnitSelector || unitSelect.getAttribute('data-stock-id') !== String(stockId))) {
            const unitConfig = this.getUnitConversionOptions(unitSymbol, stock?.unit_name || '');
            unitSelect.setAttribute('data-stock-id', String(stockId));
            if (unitConfig) {
                unitSelect.setAttribute('data-base-unit', unitConfig.baseSymbol);
                unitSelect.innerHTML = unitConfig.options
                    .map(u => `<option value="${this.escapeHtml(u.label)}" data-factor="${u.factor}">${this.escapeHtml(u.label)}</option>`)
                    .join('');
                unitSelect.style.display = 'block';
            } else {
                unitSelect.style.display = 'none';
                unitSelect.innerHTML = '';
            }
        }

        if (inCartBadge) {
            if (cartItem) {
                inCartBadge.textContent = `Already Selected: ${this.roundQty(cartItem.qty)}${displayUnit}`;
                inCartBadge.style.display = 'inline-block';
            } else {
                inCartBadge.style.display = 'none';
            }
        }

        this.syncQtyInputLimitsForUnit();
        this.updateUnitConversionHint();

        preview.style.display = 'block';
    }

    setStatuses(statuses = []) {
        this.statuses = statuses || [];
    }

    open(job, options = {}) {
        this.currentJob = job;
        if (!this.modal || !job) return;

        // Hydrate selected materials list from current job's existing allocated materials
        const initialMaterials = Array.isArray(job.materials) ? job.materials : [];
        this.cart = initialMaterials.map(m => {
            const stockId = Number(m.stock_id || m.id);
            const refStock = this.availableStocks.find(s => Number(s.id) === stockId);
            return {
                stock_id: stockId,
                name: m.name || m.item_name || refStock?.name || `Stock #${stockId}`,
                code: m.code || refStock?.code || '',
                brand: m.brand || refStock?.brand || 'Generic',
                category: m.category || refStock?.category || '',
                subcategory: m.subcategory || refStock?.subcategory || '',
                unit: m.unit || refStock?.unit || '',
                avail_qty: refStock ? this.roundQty(refStock.qty) : 9999,
                qty: this.roundQty(Math.max(0.001, parseFloat(m.qty) || 1))
            };
        });
        this.isCartDirty = false;
        this.forStartPrinting = Boolean(options.forStartPrinting);

        const header = document.getElementById('allocJobHeader');
        if (header) {
            header.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <strong style="color: var(--text); font-size: 14px;">${this.escapeHtml(job.job_number)}</strong>
                        <span style="color: var(--text-muted); font-size: 12px; margin-left: 6px;">(${this.escapeHtml(job.order_number)})</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted);">
                        <span>${this.escapeHtml(job.customer_name)}</span> • <strong>${this.escapeHtml(job.print_type_name)}</strong> (${job.qty} units)
                    </div>
                </div>
            `;
        }

        const titleEl = document.getElementById('modalAllocTitle');
        const noticeEl = document.getElementById('allocNoticeBanner');
        const btnStart = document.getElementById('btnModalStartPrinting');
        const btnSaveCart = document.getElementById('btnSaveMaterialCart');

        if (this.forStartPrinting) {
            if (titleEl) {
                titleEl.innerHTML = '<i class="fa-solid fa-print" style="color: #0284c7;"></i> Select Materials & Start Printing';
            }
            if (noticeEl) noticeEl.style.display = 'block';
            if (btnStart) btnStart.style.display = 'inline-flex';
            if (btnSaveCart) btnSaveCart.style.display = 'none';
        } else {
            if (titleEl) {
                titleEl.innerHTML = '<i class="fa-solid fa-boxes-stacked" style="color: #0284c7;"></i> Select Printing Materials';
            }
            if (noticeEl) noticeEl.style.display = 'none';
            if (btnStart) btnStart.style.display = 'none';
            if (btnSaveCart) btnSaveCart.style.display = 'inline-flex';
        }

        // Reset selectors & filter inputs
        this.selectedCategoryId = '';
        this.selectedSubcategoryId = '';
        this.searchQuery = '';

        const catSelect = document.getElementById('selectMaterialCategory');
        if (catSelect) catSelect.value = '';

        const subcatSelect = document.getElementById('selectMaterialSubcategory');
        if (subcatSelect) subcatSelect.value = '';

        const filterInput = document.getElementById('inputMaterialFilter');
        if (filterInput) filterInput.value = '';

        const inputQty = document.getElementById('inputMaterialQty');
        if (inputQty) inputQty.value = '1';

        this.populateCategoryDropdown();
        this.updateSubcategoryDropdown();
        this.filterAndRenderStockOptions();
        this.renderCart();

        this.modal.classList.add('active');
    }

    close() {
        if (this.modal) this.modal.classList.remove('active');
        this.currentJob = null;
        this.cart = [];
        this.isCartDirty = false;
        this.forStartPrinting = false;
    }

    /**
     * Add selected material item into the selected materials list.
     * If already in list, increments its quantity automatically.
     */
    addToCart() {
        if (!this.currentJob) return;

        const selectStock = document.getElementById('selectAllocateStock');
        const inputQty = document.getElementById('inputMaterialQty');
        if (!selectStock || !inputQty) return;

        const stockId = parseInt(selectStock.value, 10);
        const rawInputQty = parseFloat(inputQty.value);
        const factor = this.getSelectedUnitFactor();
        const addQty = this.roundQty(rawInputQty * factor);

        if (!stockId) {
            this.showToast('Please select a material / stock item to add.', 'warning');
            return;
        }
        if (isNaN(rawInputQty) || addQty < 0.001) {
            this.showToast('Please enter a valid quantity greater than 0 (min 0.001).', 'warning');
            return;
        }

        const refStock = this.availableStocks.find(s => Number(s.id) === stockId);
        const maxAvail = refStock ? this.roundQty(refStock.qty) : 9999;
        const unitStr = refStock?.unit && refStock.unit !== 'Units' ? ` ${refStock.unit}` : '';

        const existing = this.cart.find(item => Number(item.stock_id) === stockId);
        if (existing) {
            const nextQty = this.roundQty(existing.qty + addQty);
            if (maxAvail > 0 && nextQty > maxAvail) {
                existing.qty = maxAvail;
                this.showToast(`Adjusted "${existing.name}" to maximum available warehouse stock (${maxAvail}${unitStr}).`, 'warning');
            } else {
                existing.qty = nextQty;
                this.showToast(`Updated "${existing.name}" quantity (Total: ${existing.qty}${unitStr}).`, 'info');
            }
        } else {
            const finalQty = this.roundQty(maxAvail > 0 ? Math.min(addQty, maxAvail) : addQty);
            const itemName = refStock ? refStock.name : `Stock #${stockId}`;
            this.cart.push({
                stock_id: stockId,
                name: itemName,
                code: refStock?.code || '',
                brand: refStock?.brand || 'Generic',
                category: refStock?.category || '',
                subcategory: refStock?.subcategory || '',
                unit: refStock?.unit || '',
                avail_qty: maxAvail,
                qty: finalQty
            });
            this.showToast(`Added "${itemName}" (Qty: ${finalQty}${unitStr}) to selected materials!`, 'success');
        }

        this.isCartDirty = true;

        // Reset item selection and qty back to 1 for quick next add
        selectStock.value = '';
        inputQty.value = '1';

        this.filterAndRenderStockOptions();
        this.renderCart();
    }

    /**
     * Adjust quantity of a selected material item by delta or direct decimal value.
     */
    updateCartItemQty(stockId, newQty) {
        const item = this.cart.find(c => Number(c.stock_id) === Number(stockId));
        if (!item) return;

        let parsed = this.roundQty(newQty);
        if (isNaN(parsed) || parsed < 0.001) {
            parsed = 0.001;
        }
        if (item.avail_qty > 0 && parsed > item.avail_qty) {
            parsed = this.roundQty(item.avail_qty);
            this.showToast(`Maximum available warehouse stock for "${item.name}" is ${item.avail_qty}.`, 'warning');
        }

        if (item.qty !== parsed) {
            item.qty = parsed;
            this.isCartDirty = true;
            this.renderCart();
            this.filterAndRenderStockOptions();
        }
    }

    /**
     * Remove an item from the selected materials list.
     */
    removeFromCart(stockId) {
        const idx = this.cart.findIndex(c => Number(c.stock_id) === Number(stockId));
        if (idx === -1) return;

        const removed = this.cart[idx];
        this.cart.splice(idx, 1);
        this.isCartDirty = true;

        this.showToast(`Removed "${removed.name}" from list.`, 'info');
        this.renderCart();
        this.filterAndRenderStockOptions();
    }

    /**
     * Clear all items from the selected materials list.
     */
    clearCart() {
        if (this.cart.length === 0) return;
        this.cart = [];
        this.isCartDirty = true;
        this.showToast('Cleared all selected materials.', 'info');
        this.renderCart();
        this.filterAndRenderStockOptions();
    }

    updateFooterActionButtons() {
        const count = this.cart.length;
        const totalUnits = this.roundQty(this.cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0));

        const headerCount = document.getElementById('allocHeaderCartCount');
        if (headerCount) {
            headerCount.textContent = `${count} (${totalUnits})`;
        }

        const btnClear = document.getElementById('btnClearMaterialCart');
        if (btnClear) {
            btnClear.style.display = count > 0 ? 'inline-flex' : 'none';
        }

        const summaryBar = document.getElementById('allocCartSummaryBar');
        const summaryItems = document.getElementById('cartSummaryItemCount');
        const summaryQty = document.getElementById('cartSummaryTotalQty');
        const unsavedEl = document.getElementById('cartUnsavedIndicator');

        if (summaryBar) {
            summaryBar.style.display = count > 0 || this.isCartDirty ? 'flex' : 'none';
        }
        if (summaryItems) summaryItems.textContent = String(count);
        if (summaryQty) summaryQty.textContent = String(totalUnits);
        if (unsavedEl) {
            unsavedEl.style.display = this.isCartDirty ? 'block' : 'none';
        }

        const btnSaveCart = document.getElementById('btnSaveMaterialCart');
        if (btnSaveCart && !this.forStartPrinting) {
            btnSaveCart.innerHTML = `<i class="fa-solid fa-check-double"></i> <span>Confirm & Save Materials (${count})</span>`;
        }

        const btnStart = document.getElementById('btnModalStartPrinting');
        if (btnStart && this.forStartPrinting) {
            if (count === 0) {
                btnStart.disabled = true;
                btnStart.style.opacity = '0.45';
                btnStart.style.cursor = 'not-allowed';
                btnStart.innerHTML = '<i class="fa-solid fa-print"></i> <span>Select Materials First</span>';
            } else {
                btnStart.disabled = false;
                btnStart.style.opacity = '1';
                btnStart.style.cursor = 'pointer';
                btnStart.innerHTML = `<i class="fa-solid fa-print"></i> <span>Save & Start Printing (${count} Material${count > 1 ? 's' : ''})</span> <i class="fa-solid fa-arrow-right"></i>`;
            }
        }
    }

    renderCart() {
        const container = document.getElementById('allocatedMaterialsList');
        const badge = document.getElementById('allocCountBadge');
        if (!container || !this.currentJob) return;

        this.updateFooterActionButtons();

        const totalUnits = this.roundQty(this.cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0));

        if (badge) {
            badge.textContent = `${this.cart.length} material${this.cart.length !== 1 ? 's' : ''} (${totalUnits} units)`;
            badge.style.color = this.cart.length > 0 ? '#0284c7' : 'var(--text-muted)';
        }

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div style="font-size: 12.5px; color: var(--text-muted); background: var(--surface-2); border: 1px dashed var(--border); padding: 22px 16px; text-align: center; border-radius: 8px;">
                    <i class="fa-solid fa-boxes-stacked" style="font-size: 24px; color: #0284c7; opacity: 0.45; margin-bottom: 8px; display: block;"></i>
                    No materials selected yet. Choose a material above and click <strong>"Add Material"</strong>.
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="pj-assigned-table">
                <thead>
                    <tr>
                        <th style="width: 36px; text-align: center;">#</th>
                        <th>Material Item</th>
                        <th>Brand & Stock</th>
                        <th style="text-align: center; width: 155px;">Required Qty</th>
                        <th style="text-align: right; width: 65px;">Remove</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.cart.map((m, idx) => {
                        const codeTag = m.code
                            ? `<span style="font-family: monospace; font-size: 11px; color: #0284c7; background: rgba(2, 132, 199, 0.1); padding: 1px 6px; border-radius: 4px; margin-left: 6px;">${this.escapeHtml(m.code)}</span>`
                            : '';
                        const catSub = [m.category, m.subcategory].filter(Boolean).join(' / ');
                        return `
                            <tr data-cart-stock-id="${m.stock_id}">
                                <td style="color: var(--text-muted); font-size: 11.5px; font-weight: 600; text-align: center;">${idx + 1}</td>
                                <td>
                                    <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                                        <strong style="color: var(--text); font-size: 13px;">
                                            <i class="fa-solid fa-box" style="color: #0284c7; margin-right: 5px; font-size: 11.5px;"></i>
                                            ${this.escapeHtml(m.name)}
                                        </strong>
                                        ${codeTag}
                                    </div>
                                    ${catSub ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${this.escapeHtml(catSub)}</div>` : ''}
                                </td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                        <span style="background: var(--surface-2); border: 1px solid var(--border); padding: 2px 7px; border-radius: 4px; font-size: 11px; color: var(--text); font-weight: 600;">
                                            ${this.escapeHtml(m.brand || 'Generic')}
                                        </span>
                                        ${m.avail_qty && m.avail_qty < 9999 ? `<span style="font-size: 11px; color: #16a34a; font-weight: 600;">Avail: ${this.roundQty(m.avail_qty)}${m.unit && m.unit !== 'Units' ? ' ' + this.escapeHtml(m.unit) : ''}</span>` : ''}
                                    </div>
                                </td>
                                <td style="text-align: center;">
                                    <div style="display: inline-flex; align-items: center; gap: 4px;">
                                        <div style="display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); overflow: hidden; height: 30px;">
                                            <button type="button"
                                                    class="btn-cart-qty-minus"
                                                    data-stock-id="${m.stock_id}"
                                                    title="Decrease Quantity"
                                                    style="width: 28px; height: 100%; border: none; background: var(--surface-2); color: var(--text); cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                                                <i class="fa-solid fa-minus" style="font-size: 9px;"></i>
                                            </button>
                                            <input type="number"
                                                   class="pj-input pj-alloc-qty-input"
                                                   data-stock-id="${m.stock_id}"
                                                   value="${this.roundQty(m.qty)}"
                                                   min="0.001"
                                                   step="any"
                                                   max="${m.avail_qty || 9999}"
                                                   style="width: 66px; height: 100%; border: none; border-radius: 0; text-align: center; font-weight: 700; font-family: monospace; font-size: 12.5px; padding: 0 4px;" />
                                            <button type="button"
                                                    class="btn-cart-qty-plus"
                                                    data-stock-id="${m.stock_id}"
                                                    title="Increase Quantity"
                                                    style="width: 28px; height: 100%; border: none; background: var(--surface-2); color: var(--text); cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                                                <i class="fa-solid fa-plus" style="font-size: 9px;"></i>
                                            </button>
                                        </div>
                                        ${m.unit && m.unit !== 'Units' ? `<span style="font-size: 11px; font-weight: 700; color: #0284c7;">${this.escapeHtml(m.unit)}</span>` : ''}
                                    </div>
                                </td>
                                <td style="text-align: right;">
                                    <button type="button"
                                            class="pj-btn-icon-sm btn-remove-stock"
                                            data-stock-id="${m.stock_id}"
                                            title="Remove from Cart"
                                            style="color: #ff4d4f; width: 30px; height: 30px; border-radius: 6px; border: 1px solid rgba(255, 77, 79, 0.3); background: rgba(255, 77, 79, 0.08); display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        // Bind Minus stepper buttons
        container.querySelectorAll('.btn-cart-qty-minus').forEach(btn => {
            btn.onclick = () => {
                const stockId = parseInt(btn.getAttribute('data-stock-id'), 10);
                const item = this.cart.find(c => Number(c.stock_id) === stockId);
                if (item) {
                    const step = item.qty <= 1 || !Number.isInteger(item.qty) ? 0.1 : 1;
                    const nextVal = this.roundQty(item.qty - step);
                    if (nextVal >= 0.001) {
                        this.updateCartItemQty(stockId, nextVal);
                    }
                }
            };
        });

        // Bind Plus stepper buttons
        container.querySelectorAll('.btn-cart-qty-plus').forEach(btn => {
            btn.onclick = () => {
                const stockId = parseInt(btn.getAttribute('data-stock-id'), 10);
                const item = this.cart.find(c => Number(c.stock_id) === stockId);
                if (item) {
                    const step = item.qty < 1 || !Number.isInteger(item.qty) ? 0.1 : 1;
                    this.updateCartItemQty(stockId, this.roundQty(item.qty + step));
                }
            };
        });

        // Bind direct quantity input changes
        container.querySelectorAll('.pj-alloc-qty-input').forEach(input => {
            input.onchange = () => {
                const stockId = parseInt(input.getAttribute('data-stock-id'), 10);
                this.updateCartItemQty(stockId, input.value);
            };
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const stockId = parseInt(input.getAttribute('data-stock-id'), 10);
                    this.updateCartItemQty(stockId, input.value);
                }
            };
        });

        // Bind Remove from cart buttons
        container.querySelectorAll('.btn-remove-stock').forEach(btn => {
            btn.onclick = () => {
                const stockId = parseInt(btn.getAttribute('data-stock-id'), 10);
                this.removeFromCart(stockId);
            };
        });
    }

    /**
     * Persist the entire materials cart to the backend via syncStockItems.
     */
    async saveCart(options = {}) {
        if (!this.currentJob || this.isSavingCart) return false;

        this.isSavingCart = true;
        const btnSave = document.getElementById('btnSaveMaterialCart');
        const originalText = btnSave ? btnSave.innerHTML : '';

        if (btnSave) {
            btnSave.disabled = true;
            btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving Materials...';
        }

        try {
            const payload = this.cart.map(item => ({
                stock_id: Number(item.stock_id),
                qty: this.roundQty(Math.max(0.001, parseFloat(item.qty) || 0.001))
            }));

            const updatedData = await this.dataLoader.syncStockItems(this.currentJob.id, payload);

            if (updatedData && Array.isArray(updatedData.materials)) {
                this.currentJob.materials = updatedData.materials;
                this.currentJob.materials_count = updatedData.materials.length;
            } else {
                this.currentJob.materials = this.cart.map(c => ({ ...c }));
                this.currentJob.materials_count = this.cart.length;
            }

            this.isCartDirty = false;
            this.renderCart();
            this.onJobUpdated();

            this.showToast(`Selected materials saved (${this.cart.length} item${this.cart.length !== 1 ? 's' : ''})!`, 'success');

            if (options.closeOnSuccess) {
                this.close();
            }

            return true;
        } catch (err) {
            this.showToast(err.message || 'Failed to save selected materials.', 'error');
            return false;
        } finally {
            this.isSavingCart = false;
            if (btnSave) {
                btnSave.disabled = false;
                btnSave.innerHTML = originalText;
                this.updateFooterActionButtons();
            }
        }
    }

    async submitStartPrinting() {
        if (!this.currentJob || this.isSavingCart) return;

        if (this.cart.length === 0) {
            this.showToast('Please select at least one material before starting printing.', 'warning');
            return;
        }

        const btn = document.getElementById('btnModalStartPrinting');
        const originalText = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving & Starting Printing...';
        }

        try {
            const payload = this.cart.map(item => ({
                stock_id: Number(item.stock_id),
                qty: this.roundQty(Math.max(0.001, parseFloat(item.qty) || 0.001))
            }));

            await this.dataLoader.syncStockItems(this.currentJob.id, payload);

            const printingStatus = (this.statuses || []).find(s => String(s.name || '').toLowerCase().trim() === 'printing');
            const statusId = printingStatus ? printingStatus.id : 4;

            await this.dataLoader.updateStatus(this.currentJob.id, statusId);
            this.showToast(`Materials saved & Job ${this.currentJob.job_number} moved to Printing!`, 'success');
            this.close();

            if (typeof this.onStartPrintingSuccess === 'function') {
                this.onStartPrintingSuccess(this.currentJob.id);
            } else {
                this.onJobUpdated();
            }
        } catch (err) {
            this.showToast(err.message || 'Failed to save materials and start printing.', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
