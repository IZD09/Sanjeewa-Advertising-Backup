/**
 * PrintJobDetailsModal - Handles Job Details & Status History Timeline
 */
export class PrintJobDetailsModal {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
        this.modal = document.getElementById('modalJobDetails');
    }

    async open(job) {
        if (!this.modal || !job) return;

        // Basic Info
        document.getElementById('detailsJobCode').textContent = `${job.job_number} (${job.order_number})`;
        document.getElementById('detailsCustomerName').textContent = job.customer_name;
        document.getElementById('detailsCustomerContact').textContent = `${job.customer_mobile || '—'} ${job.customer_email ? `• ${job.customer_email}` : ''}`;
        document.getElementById('detailsPrintType').textContent = job.print_type_name;
        document.getElementById('detailsQuantity').textContent = `${job.qty} units`;
        document.getElementById('detailsDate').textContent = job.date_formatted;
        document.getElementById('detailsOperator').textContent = job.operator_name;

        // Financials
        document.getElementById('detailsTotalAmount').textContent = `Rs. ${Number(job.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        document.getElementById('detailsPaidAmount').textContent = `Rs. ${Number(job.paid_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        document.getElementById('detailsBalanceAmount').textContent = `Rs. ${Number(job.balance_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        const payBadge = document.getElementById('detailsPaymentBadge');
        if (payBadge) {
            payBadge.textContent = job.payment_status;
            payBadge.className = `pj-pay-badge ${job.payment_status === 'Paid' ? 'paid' : (job.payment_status === 'Partially Paid' ? 'partially-paid' : 'unpaid')}`;
        }

        // Assigned Materials List
        const matContainer = document.getElementById('detailsMaterialsList');
        if (matContainer) {
            let materials = Array.isArray(job.materials) ? job.materials : [];

            // If empty in memory, attempt to fetch fresh details from API
            if (materials.length === 0 && this.dataLoader && typeof this.dataLoader.fetchJob === 'function') {
                try {
                    const fresh = await this.dataLoader.fetchJob(job.id);
                    if (fresh) {
                        if (Array.isArray(fresh.materials) && fresh.materials.length > 0) {
                            materials = fresh.materials;
                        } else if (Array.isArray(fresh.stock_items) && fresh.stock_items.length > 0) {
                            materials = fresh.stock_items.map(s => ({
                                stock_id: s.stock_id,
                                name: s.name || s.item_name || `Stock #${s.stock_id}`,
                                brand: s.brand || '',
                                qty: s.qty || 1
                            }));
                        }
                        job.materials = materials;
                        job.materials_count = materials.length;
                    }
                } catch (e) {
                    console.warn('Could not fetch fresh materials for job details:', e);
                }
            }

            if (materials && materials.length > 0) {
                matContainer.innerHTML = `
                    <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; margin-bottom: 6px; font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between;">
                        <span><i class="fa-solid fa-boxes-stacked" style="color: #0284c7; margin-right: 5px;"></i> Materials allocated for printing</span>
                        <strong style="color: var(--text);">${materials.length} item${materials.length > 1 ? 's' : ''}</strong>
                    </div>
                    <table class="pj-assigned-table">
                        <thead>
                            <tr>
                                <th style="width: 30px;">#</th>
                                <th>Material / Stock Item</th>
                                <th>Brand</th>
                                <th style="text-align: right; width: 110px;">Assigned Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${materials.map((m, idx) => `
                                <tr>
                                    <td style="color: var(--text-muted); font-size: 11px;">${idx + 1}</td>
                                    <td>
                                        <strong style="color: var(--text);">
                                            <i class="fa-solid fa-box" style="color: #0284c7; margin-right: 4px; font-size: 11px;"></i>
                                            ${this.escapeHtml(m.name || m.item_name || 'Material')}
                                        </strong>
                                    </td>
                                    <td>
                                        <span style="background: var(--surface-2); border: 1px solid var(--border); padding: 2px 7px; border-radius: 4px; font-size: 11px; color: var(--text);">
                                            ${this.escapeHtml(m.brand || 'Generic')}
                                        </span>
                                    </td>
                                    <td style="text-align: right; font-weight: 700; font-family: monospace; color: #0284c7;">
                                        ${m.qty}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                matContainer.innerHTML = '<div style="font-size: 12px; color: #94a3b8; font-style: italic; padding: 8px 0;"><i class="fa-solid fa-circle-exclamation" style="margin-right: 4px;"></i> No stock materials currently linked to this job.</div>';
            }
        }

        // Timeline Container
        const timelineWrap = document.getElementById('detailsTimelineContainer');
        this.modal.classList.add('active');

        if (timelineWrap) {
            timelineWrap.innerHTML = '<div style="font-size: 12px; color: #8c8c8c;"><i class="fa-solid fa-spinner fa-spin"></i> Loading status history...</div>';

            try {
                const history = await this.dataLoader.fetchStatusHistory(job.id);
                if (history && history.length > 0) {
                    timelineWrap.innerHTML = `
                        <div class="pj-timeline">
                            ${history.map(h => {
                                const stateName = h.status?.print_job_states || 'Status Update';
                                const updateAt = h.update_at ? new Date(h.update_at).toLocaleString() : '—';
                                return `
                                    <div class="pj-timeline-item">
                                        <div class="pj-timeline-dot"></div>
                                        <div class="pj-timeline-status">${this.escapeHtml(stateName)}</div>
                                        <div class="pj-timeline-date"><i class="fa-regular fa-clock"></i> ${this.escapeHtml(updateAt)}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                } else {
                    timelineWrap.innerHTML = `
                        <div class="pj-timeline">
                            <div class="pj-timeline-item">
                                <div class="pj-timeline-dot"></div>
                                <div class="pj-timeline-status">${this.escapeHtml(job.status_name)}</div>
                                <div class="pj-timeline-date">${this.escapeHtml(job.date_formatted)}</div>
                            </div>
                        </div>
                    `;
                }
            } catch (err) {
                timelineWrap.innerHTML = `<div style="font-size: 12px; color: #cf1322;">Failed to load timeline. Current status: ${this.escapeHtml(job.status_name)}</div>`;
            }
        }
    }

    close() {
        if (this.modal) this.modal.classList.remove('active');
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
