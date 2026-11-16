import { StatusHelper } from '../../core/StatusHelper.js';

/**
 * PrintJobTableBuilder - Builds HTML table rows for the Print Jobs table view
 */
export class PrintJobTableBuilder {
    /**
     * Build row HTML for a single job
     * @param {Object} job 
     * @returns {string} HTML string
     */
    static buildRow(job) {
        const materialsSummary = job.materials_count > 0
            ? job.materials.map(m => `
                <span class="pj-spec-tag" style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
                    <i class="fa-solid fa-box"></i> ${this.escapeHtml(m.name)} (${m.qty})
                </span>
            `).join(' ')
            : `<span style="color: #94a3b8; font-size: 11px;">Not allocated</span>`;

        const paymentClass = job.payment_status === 'Paid'
            ? 'paid'
            : (job.payment_status === 'Partially Paid' ? 'partially-paid' : 'unpaid');
        const statusLower = String(job.status_name || '').toLowerCase().trim();
        const isApproved = statusLower === 'approved';
        const isCancelled = statusLower === 'cancelled' || statusLower === 'rejected';
        const statusRowClass = StatusHelper.getStatusRowClass(job.status_name);

        return `
            <tr data-job-id="${job.id}"${statusRowClass ? ` class="${statusRowClass}"` : ''}>
                <td>
                    <div style="font-weight: 700; font-family: monospace; color: var(--text, #0f172a);">${this.escapeHtml(job.job_number)}</div>
                    <div style="font-size: 11px; color: var(--text-muted, #64748b);">${this.escapeHtml(job.order_number)}</div>
                    ${job.date_formatted ? `<div style="font-size: 10.5px; color: var(--text-muted, #94a3b8); margin-top: 2px;"><i class="fa-regular fa-clock" style="margin-right: 3px;"></i>${this.escapeHtml(job.date_formatted)}${job.time_formatted && job.time_formatted !== '—' ? ` • ${this.escapeHtml(job.time_formatted)}` : ''}</div>` : ''}
                </td>
                <td>
                    <div style="font-weight: 600;">${this.escapeHtml(job.customer_name)}</div>
                    <div style="font-size: 11px; color: var(--text-muted, #64748b);"><i class="fa-solid fa-phone"></i> ${this.escapeHtml(job.customer_mobile)}</div>
                </td>
                <td>
                    <span class="pj-spec-tag"><i class="fa-solid fa-print"></i> ${this.escapeHtml(job.print_type_name)}</span>
                </td>
                <td>
                    <span class="pj-qty-tag">${job.qty} pcs</span>
                </td>
                <td>
                    ${materialsSummary}
                </td>
                <td>
                    <span class="pj-badge ${job.badge_class}">
                        ${this.escapeHtml(job.status_name)}
                    </span>
                </td>
                <td>
                    <div style="font-weight: 600; font-size: 12.5px;">Rs. ${Number(job.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    <span class="pj-pay-badge ${paymentClass}">${this.escapeHtml(job.payment_status)}</span>
                </td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; align-items: center; gap: 5px;">
                        <button type="button" class="pj-btn-icon-sm btn-action-approve" data-job-id="${job.id}" title="Approve Order" ${isApproved || isCancelled ? 'disabled' : ''}>
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button type="button" class="pj-btn-icon-sm btn-action-cancel" data-job-id="${job.id}" title="Cancel Order" ${isCancelled ? 'disabled' : ''}>
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <div class="row-action-menu-wrap">
                            <button type="button" class="pj-btn-icon-sm btn-action-more" title="More Actions">
                                <i class="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            <div class="row-action-dropdown" style="display: none;">
                                <button type="button" class="row-action-item btn-action-details" data-job-id="${job.id}">
                                    <i class="fa-solid fa-eye"></i><span>Details &amp; Timeline</span>
                                </button>
                                <button type="button" class="row-action-item btn-action-allocate" data-job-id="${job.id}">
                                    <i class="fa-solid fa-boxes-stacked"></i><span>Allocate Stock</span>
                                </button>
                                <button type="button" class="row-action-item btn-action-status" data-job-id="${job.id}">
                                    <i class="fa-solid fa-arrow-right"></i><span>Update Status</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Build empty table message HTML
     */
    static buildEmpty(colspan = 8) {
        return `
            <tr>
                <td colspan="${colspan}" style="text-align: center; padding: 48px 16px; color: #8c8c8c;">
                    <i class="fa-solid fa-folder-open" style="font-size: 28px; margin-bottom: 10px; display: block; color: #cbd5e1;"></i>
                    <div style="font-size: 13px; font-weight: 500;">No print jobs found</div>
                    <div style="font-size: 11.5px; color: #94a3b8; margin-top: 4px;">Try adjusting your search or category filter.</div>
                </td>
            </tr>
        `;
    }

    static escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
