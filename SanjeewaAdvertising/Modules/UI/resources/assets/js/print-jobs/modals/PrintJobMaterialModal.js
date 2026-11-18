/**
 * PrintJobMaterialModal - Handles Raw Stock & Materials Allocation
 */
export class PrintJobMaterialModal {
    constructor(dataLoader, options = {}) {
        this.dataLoader = dataLoader;
        this.onJobUpdated = options.onJobUpdated || (() => {});
        this.onStartPrintingSuccess = options.onStartPrintingSuccess || null;
        this.showToast = options.showToast || ((msg, type) => alert(msg));
        this.modal = document.getElementById('modalAllocateMaterial');
        this.currentJob = null;
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
        const btnAdd = document.getElementById('btnSubmitAssignMaterial');
        if (btnAdd) {
            btnAdd.onclick = () => this.submitAssign();
        }

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
            selectStock.onchange = () => this.updateStockPreview();
        }
    }

    setReferenceData(stocks = [], categories = [], subcategories = []) {
        this.availableStocks = stocks || [];
        this.categories = categories || [];
        this.subcategories = subcategories || [];

        // Fallback: extract unique categories & subcategories from stocks if empty
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

        // Only rebuild selects if modal is not currently open
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
                return `
                    <option value="${s.id}" data-code="${this.escapeHtml(s.code || '')}" data-brand="${this.escapeHtml(s.brand || '')}" data-category="${this.escapeHtml(s.category || '')}" data-subcategory="${this.escapeHtml(s.subcategory || '')}" data-qty="${s.qty}">
                        ${codePart}${this.escapeHtml(s.name)}${brandPart}${catPart} — Avail: ${s.qty}
                    </option>
                `;
            }).join('');

        this.updateStockPreview();
    }

    updateStockPreview() {
        const select = document.getElementById('selectAllocateStock');
        const preview = document.getElementById('allocStockItemPreview');
        const inputQty = document.getElementById('inputMaterialQty');
        if (!select || !preview) return;

        const opt = select.selectedOptions ? select.selectedOptions[0] : null;
        if (!opt || !opt.value) {
            preview.style.display = 'none';
            return;
        }

        const stockId = parseInt(opt.value, 10);
        const stock = this.availableStocks.find(s => s.id === stockId);

        const codeEl = document.getElementById('previewStockCode');
        const brandEl = document.getElementById('previewStockBrand');
        const catEl = document.getElementById('previewStockCategory');
        const qtyEl = document.getElementById('previewStockQty');

        if (codeEl) codeEl.textContent = stock?.code || opt.getAttribute('data-code') || '—';
        if (brandEl) brandEl.textContent = stock?.brand || opt.getAttribute('data-brand') || 'Generic';

        const catName = stock?.category || opt.getAttribute('data-category') || '';
        const subcatName = stock?.subcategory || opt.getAttribute('data-subcategory') || '';
        if (catEl) {
            catEl.textContent = [catName, subcatName].filter(Boolean).join(' / ') || 'General';
        }

        const availQty = stock ? stock.qty : (parseInt(opt.getAttribute('data-qty'), 10) || 0);
        if (qtyEl) qtyEl.textContent = `${availQty} in stock`;

        if (inputQty && availQty > 0) {
            inputQty.max = availQty;
        }

        preview.style.display = 'block';
    }

    setStatuses(statuses = []) {
        this.statuses = statuses || [];
    }

    open(job, options = {}) {
        this.currentJob = job;
        if (!this.modal || !job) return;

        this.currentJob.materials = Array.isArray(job.materials) ? job.materials : [];
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

        if (this.forStartPrinting) {
            if (titleEl) {
                titleEl.innerHTML = '<i class="fa-solid fa-print" style="color: #0284c7;"></i> Select Materials & Start Printing';
            }
            if (noticeEl) noticeEl.style.display = 'block';
            if (btnStart) btnStart.style.display = 'inline-flex';
        } else {
            if (titleEl) {
                titleEl.innerHTML = '<i class="fa-solid fa-boxes-stacked" style="color: #0284c7;"></i> Select Printing Materials';
            }
            if (noticeEl) noticeEl.style.display = 'none';
            if (btnStart) btnStart.style.display = 'none';
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
        this.renderAllocatedList();

        this.modal.classList.add('active');
    }

    close() {
        if (this.modal) this.modal.classList.remove('active');
        this.currentJob = null;
        this.forStartPrinting = false;
    }

    updateStartPrintingButton() {
        const btn = document.getElementById('btnModalStartPrinting');
        if (!btn || !this.forStartPrinting) return;

        const count = (this.currentJob?.materials || []).length;
        if (count === 0) {
            btn.disabled = true;
            btn.style.opacity = '0.45';
            btn.style.cursor = 'not-allowed';
            btn.innerHTML = '<i class="fa-solid fa-print"></i> <span>Start Printing (Select Materials First)</span>';
            btn.title = 'Please select and assign at least one material to start printing';
        } else {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.innerHTML = `<i class="fa-solid fa-print"></i> <span>Start Printing (${count} Material${count > 1 ? 's' : ''})</span> <i class="fa-solid fa-arrow-right"></i>`;
            btn.title = 'Start printing on machine with selected materials';
        }
    }

    renderAllocatedList() {
        const container = document.getElementById('allocatedMaterialsList');
        const badge = document.getElementById('allocCountBadge');
        if (!container || !this.currentJob) return;

        const materials = this.currentJob.materials || [];
        this.updateStartPrintingButton();

        if (badge) {
            badge.textContent = `${materials.length} material${materials.length !== 1 ? 's' : ''} added`;
            badge.style.color = materials.length > 0 ? '#0284c7' : 'var(--text-muted)';
        }

        if (materials.length === 0) {
            container.innerHTML = `
                <div style="font-size: 12px; color: #d97706; background: rgba(245, 158, 11, 0.08); border: 1px dashed rgba(245, 158, 11, 0.35); padding: 14px; text-align: center; border-radius: 6px;">
                    <i class="fa-solid fa-triangle-exclamation" style="margin-right: 5px;"></i>
                    No materials added yet. Choose Category, Subcategory & Material from above and click <strong>"+ Add"</strong>. You can add multiple materials.
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="pj-assigned-table">
                <thead>
                    <tr>
                        <th style="width: 32px; text-align: center;">#</th>
                        <th>Material Item</th>
                        <th>Brand</th>
                        <th style="text-align: right; width: 140px;">Allocated Qty</th>
                        <th style="text-align: right; width: 60px;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${materials.map((m, idx) => `
                        <tr>
                            <td style="color: var(--text-muted); font-size: 11px; text-align: center;">${idx + 1}</td>
                            <td>
                                <strong style="color: var(--text);">
                                    <i class="fa-solid fa-boxes-stacked" style="color: #0284c7; margin-right: 4px; font-size: 11px;"></i>
                                    ${this.escapeHtml(m.name || m.item_name || 'Material')}
                                </strong>
                            </td>
                            <td>
                                <span style="background: var(--surface-2); border: 1px solid var(--border); padding: 2px 7px; border-radius: 4px; font-size: 11px; color: var(--text);">
                                    ${this.escapeHtml(m.brand || 'Generic')}
                                </span>
                            </td>
                            <td style="text-align: right;">
                                <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 5px;">
                                    <input type="number" 
                                           class="pj-input pj-alloc-qty-input" 
                                           data-stock-id="${m.stock_id}" 
                                           data-orig-qty="${m.qty}"
                                           value="${m.qty}" 
                                           min="1" 
                                           style="width: 65px; height: 28px; text-align: center; font-weight: 700; font-family: monospace; font-size: 12px; padding: 2px 4px;" />
                                    <button type="button" 
                                            class="pj-btn-icon-sm btn-update-mat-qty" 
                                            data-stock-id="${m.stock_id}" 
                                            title="Update Quantity" 
                                            style="color: #0284c7; width: 28px; height: 28px; border-radius: 4px; border: 1px solid rgba(2, 132, 199, 0.3); background: rgba(2, 132, 199, 0.08); display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                        <i class="fa-solid fa-check"></i>
                                    </button>
                                </div>
                            </td>
                            <td style="text-align: right;">
                                <button type="button" 
                                        class="pj-btn-icon-sm btn-remove-stock" 
                                        data-stock-id="${m.stock_id}" 
                                        title="Remove Material" 
                                        style="color: #ff4d4f; width: 28px; height: 28px; border-radius: 4px; border: 1px solid rgba(255, 77, 79, 0.3); background: rgba(255, 77, 79, 0.08); display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Bind Remove events
        container.querySelectorAll('.btn-remove-stock').forEach(btn => {
            btn.onclick = async () => {
                const stockId = parseInt(btn.getAttribute('data-stock-id'), 10);
                await this.removeStock(stockId);
            };
        });

        // Bind Update Qty events
        container.querySelectorAll('.btn-update-mat-qty').forEach(btn => {
            btn.onclick = async () => {
                const stockId = parseInt(btn.getAttribute('data-stock-id'), 10);
                const row = btn.closest('tr');
                const input = row ? row.querySelector('.pj-alloc-qty-input') : null;
                if (!input) return;

                const newQty = parseInt(input.value, 10);
                await this.updateQuantity(stockId, newQty, btn, input);
            };
        });

        // Enter key & change highlight on Qty input
        container.querySelectorAll('.pj-alloc-qty-input').forEach(input => {
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const row = input.closest('tr');
                    const btn = row ? row.querySelector('.btn-update-mat-qty') : null;
                    if (btn) btn.click();
                }
            };

            input.oninput = () => {
                const orig = parseInt(input.getAttribute('data-orig-qty'), 10);
                const current = parseInt(input.value, 10);
                const row = input.closest('tr');
                const btn = row ? row.querySelector('.btn-update-mat-qty') : null;
                if (btn) {
                    if (current !== orig && current > 0) {
                        btn.style.background = '#0284c7';
                        btn.style.color = '#ffffff';
                        btn.style.borderColor = '#0284c7';
                    } else {
                        btn.style.background = 'rgba(2, 132, 199, 0.08)';
                        btn.style.color = '#0284c7';
                        btn.style.borderColor = 'rgba(2, 132, 199, 0.3)';
                    }
                }
            };
        });
    }

    async submitAssign() {
        if (!this.currentJob) return;

        const selectStock = document.getElementById('selectAllocateStock');
        const inputQty = document.getElementById('inputMaterialQty');
        const stockId = parseInt(selectStock.value, 10);
        const qty = parseInt(inputQty.value, 10);

        if (!stockId) {
            this.showToast('Please select a material / stock item from the list.', 'warning');
            return;
        }
        if (!qty || qty <= 0) {
            this.showToast('Please enter a valid quantity of at least 1.', 'warning');
            return;
        }

        const btn = document.getElementById('btnSubmitAssignMaterial');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';

        try {
            const updatedData = await this.dataLoader.assignStockItem(this.currentJob.id, stockId, qty);

            // Update in-memory job materials directly from response or locally
            if (updatedData && Array.isArray(updatedData.materials)) {
                this.currentJob.materials = updatedData.materials;
                this.currentJob.materials_count = updatedData.materials.length;
            } else {
                const selectedOpt = this.availableStocks.find(s => s.id === stockId);
                this.currentJob.materials = Array.isArray(this.currentJob.materials) ? this.currentJob.materials : [];
                const existingMat = this.currentJob.materials.find(m => m.stock_id === stockId);
                if (existingMat) {
                    existingMat.qty = qty;
                } else {
                    this.currentJob.materials.push({
                        stock_id: stockId,
                        name: selectedOpt ? selectedOpt.name : `Stock #${stockId}`,
                        brand: selectedOpt ? selectedOpt.brand : '',
                        qty: qty
                    });
                }
                this.currentJob.materials_count = this.currentJob.materials.length;
            }

            const itemObj = this.availableStocks.find(s => s.id === stockId);
            const itemName = itemObj ? itemObj.name : 'Material';
            this.showToast(`"${itemName}" (Qty: ${qty}) added successfully!`, 'success');

            // Reset only material dropdown and quantity input, leaving categories for easy next pick
            selectStock.value = '';
            inputQty.value = '1';
            this.updateStockPreview();

            // Re-render table below
            this.renderAllocatedList();

            // Notify parent without full page disruptions
            this.onJobUpdated();
        } catch (err) {
            this.showToast(err.message || 'Failed to assign stock material.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    async updateQuantity(stockId, newQty, btn = null, input = null) {
        if (!this.currentJob) return;

        if (isNaN(newQty) || newQty <= 0) {
            this.showToast('Please enter a valid quantity of at least 1.', 'warning');
            if (input) input.focus();
            return;
        }

        const origQty = input ? parseInt(input.getAttribute('data-orig-qty'), 10) : null;
        if (origQty !== null && newQty === origQty) {
            this.showToast('Quantity is unchanged.', 'info');
            return;
        }

        let originalBtnHtml = '';
        if (btn) {
            originalBtnHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="font-size: 11px;"></i>';
        }

        try {
            const updatedData = await this.dataLoader.assignStockItem(this.currentJob.id, stockId, newQty);
            this.showToast(`Material quantity updated to ${newQty}!`, 'success');

            if (updatedData && Array.isArray(updatedData.materials)) {
                this.currentJob.materials = updatedData.materials;
                this.currentJob.materials_count = updatedData.materials.length;
            } else {
                const mat = (this.currentJob.materials || []).find(m => m.stock_id === stockId);
                if (mat) mat.qty = newQty;
            }

            if (input) {
                input.setAttribute('data-orig-qty', String(newQty));
            }
            if (btn) {
                btn.style.background = 'rgba(2, 132, 199, 0.08)';
                btn.style.color = '#0284c7';
                btn.style.borderColor = 'rgba(2, 132, 199, 0.3)';
            }

            this.onJobUpdated();
        } catch (err) {
            this.showToast(err.message || 'Failed to update material quantity.', 'error');
            if (input && origQty !== null) {
                input.value = origQty;
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalBtnHtml;
            }
        }
    }

    async removeStock(stockId) {
        if (!this.currentJob) return;
        try {
            const updatedData = await this.dataLoader.removeStockItem(this.currentJob.id, stockId);
            this.showToast('Material allocation removed.', 'success');

            if (updatedData && Array.isArray(updatedData.materials)) {
                this.currentJob.materials = updatedData.materials;
                this.currentJob.materials_count = updatedData.materials.length;
            } else {
                this.currentJob.materials = (this.currentJob.materials || []).filter(m => m.stock_id !== stockId);
                this.currentJob.materials_count = this.currentJob.materials.length;
            }

            this.renderAllocatedList();
            this.onJobUpdated();
        } catch (err) {
            this.showToast(err.message || 'Failed to remove material.', 'error');
        }
    }

    async submitStartPrinting() {
        if (!this.currentJob) return;

        const materials = this.currentJob.materials || [];
        if (materials.length === 0) {
            this.showToast('Please select and assign at least one material before starting printing.', 'warning');
            return;
        }

        const btn = document.getElementById('btnModalStartPrinting');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Starting Printing...';

        try {
            const printingStatus = (this.statuses || []).find(s => String(s.name || '').toLowerCase().trim() === 'printing');
            const statusId = printingStatus ? printingStatus.id : 4;

            await this.dataLoader.updateStatus(this.currentJob.id, statusId);
            this.showToast(`Job ${this.currentJob.job_number} moved to Printing on Machine!`, 'success');
            this.close();

            if (typeof this.onStartPrintingSuccess === 'function') {
                this.onStartPrintingSuccess(this.currentJob.id);
            } else {
                this.onJobUpdated();
            }
        } catch (err) {
            this.showToast(err.message || 'Failed to start printing.', 'error');
            btn.disabled = false;
            btn.innerHTML = originalText;
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
