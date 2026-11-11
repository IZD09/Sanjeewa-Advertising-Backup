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
            if (job.materials && job.materials.length > 0) {
                matContainer.innerHTML = `
                    <table class="pj-assigned-table">
                        <thead>
                            <tr><th>Material</th><th>Brand</th><th>Assigned Qty</th></tr>
                        </thead>
                        <tbody>
                            ${job.materials.map(m => `
                                <tr>
                                    <td><strong>${this.escapeHtml(m.name)}</strong></td>
                                    <td>${this.escapeHtml(m.brand || '—')}</td>
                                    <td>${m.qty}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                matContainer.innerHTML = '<div style="font-size: 12px; color: #94a3b8; font-style: italic;">No stock materials currently linked to this job.</div>';
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
