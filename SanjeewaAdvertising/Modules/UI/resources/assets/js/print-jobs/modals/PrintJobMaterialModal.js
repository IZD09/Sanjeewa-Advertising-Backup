/**
 * PrintJobMaterialModal - Handles Raw Stock & Materials Allocation
 */
export class PrintJobMaterialModal {
    constructor(dataLoader, options = {}) {
        this.dataLoader = dataLoader;
        this.onJobUpdated = options.onJobUpdated || (() => {});
        this.showToast = options.showToast || ((msg, type) => alert(msg));
        this.modal = document.getElementById('modalAllocateMaterial');
        this.currentJob = null;
        this.availableStocks = [];

        this.initEvents();
    }

    initEvents() {
        const btnSave = document.getElementById('btnSubmitAssignMaterial');
        if (btnSave) {
            btnSave.onclick = () => this.submitAssign();
        }
    }

    setAvailableStocks(stocks = []) {
        this.availableStocks = stocks;
        const select = document.getElementById('selectAllocateStock');
        if (!select) return;

        select.innerHTML = '<option value="">-- Choose Raw Material / Stock Item --</option>' +
            stocks.map(s => `
                <option value="${s.id}">
                    ${this.escapeHtml(s.name)} ${s.brand ? `[${this.escapeHtml(s.brand)}]` : ''} - (Available: ${s.qty} in stock)
                </option>
            `).join('');
    }

    open(job) {
        this.currentJob = job;
        if (!this.modal || !job) return;

        const header = document.getElementById('allocJobHeader');
        if (header) header.textContent = `${job.job_number} • ${job.print_type_name} (${job.qty} units)`;

        this.renderAllocatedList();

        const inputQty = document.getElementById('inputMaterialQty');
        if (inputQty) inputQty.value = '1';

        this.modal.classList.add('active');
    }

    close() {
        if (this.modal) this.modal.classList.remove('active');
        this.currentJob = null;
    }

    renderAllocatedList() {
        const container = document.getElementById('allocatedMaterialsList');
        if (!container || !this.currentJob) return;

        const materials = this.currentJob.materials || [];
        if (materials.length === 0) {
            container.innerHTML = '<div style="font-size: 12px; color: #94a3b8; padding: 12px; text-align: center;">No materials allocated to this job yet.</div>';
            return;
        }

        container.innerHTML = `
            <table class="pj-assigned-table">
                <thead>
                    <tr>
                        <th>Material Item</th>
                        <th>Brand</th>
                        <th>Allocated Qty</th>
                        <th style="text-align: right;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${materials.map(m => `
                        <tr>
                            <td><strong>${this.escapeHtml(m.name)}</strong></td>
                            <td>${this.escapeHtml(m.brand || '—')}</td>
                            <td>${m.qty}</td>
                            <td style="text-align: right;">
                                <button type="button" class="pj-btn-icon-sm btn-remove-stock" data-stock-id="${m.stock_id}" title="Remove Allocation" style="color: #ff4d4f;">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.querySelectorAll('.btn-remove-stock').forEach(btn => {
            btn.onclick = async () => {
                const stockId = parseInt(btn.getAttribute('data-stock-id'), 10);
                await this.removeStock(stockId);
            };
        });
    }

    async removeStock(stockId) {
        if (!this.currentJob) return;
        try {
            await this.dataLoader.removeStockItem(this.currentJob.id, stockId);
            this.showToast('Material allocation removed.', 'success');
            this.currentJob.materials = this.currentJob.materials.filter(m => m.stock_id !== stockId);
            this.currentJob.materials_count = this.currentJob.materials.length;
            this.renderAllocatedList();
            this.onJobUpdated();
        } catch (err) {
            this.showToast(err.message || 'Failed to remove material.', 'error');
        }
    }

    async submitAssign() {
        if (!this.currentJob) return;

        const selectStock = document.getElementById('selectAllocateStock');
        const inputQty = document.getElementById('inputMaterialQty');
        const stockId = parseInt(selectStock.value, 10);
        const qty = parseInt(inputQty.value, 10);

        if (!stockId) {
            this.showToast('Please select a stock material.', 'warning');
            return;
        }
        if (!qty || qty <= 0) {
            this.showToast('Please enter a valid quantity.', 'warning');
            return;
        }

        const btn = document.getElementById('btnSubmitAssignMaterial');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Assigning...';

        try {
            await this.dataLoader.assignStockItem(this.currentJob.id, stockId, qty);
            this.showToast('Stock material assigned successfully!', 'success');

            const selectedOpt = this.availableStocks.find(s => s.id === stockId);
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
            this.renderAllocatedList();
            this.onJobUpdated();
        } catch (err) {
            this.showToast(err.message || 'Failed to assign stock material.', 'error');
        } finally {
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
