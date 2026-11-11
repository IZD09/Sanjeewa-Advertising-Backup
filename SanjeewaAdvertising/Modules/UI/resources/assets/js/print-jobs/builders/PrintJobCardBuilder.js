/**
 * PrintJobCardBuilder - Builds light-themed production job cards
 */
export class PrintJobCardBuilder {
    /**
     * Map stage keys to card color theme classes
     */
    static getStageThemeClass(stageKey) {
        switch (stageKey) {
            case 'prepress':
                return 'card-purple';
            case 'printing':
                return 'card-blue';
            case 'finishing':
                return 'card-amber';
            case 'ready':
                return 'card-mint';
            case 'completed':
                return 'card-slate';
            default:
                return 'card-purple';
        }
    }

    /**
     * Build HTML for a single job card
     * @param {Object} job 
     * @param {string} stageKey 
     * @returns {string} HTML string
     */
    static build(job, stageKey) {
        const themeClass = this.getStageThemeClass(stageKey || job.stage_key);
        
        const materialHtml = job.materials_count > 0
            ? `<div class="pj-card-materials has-material" title="Allocated Materials">
                 <i class="fa-solid fa-boxes-stacked"></i>
                 <span class="pj-material-name">${this.escapeHtml(job.materials[0].name)} ${job.materials.length > 1 ? `(+${job.materials.length - 1} more)` : ''}</span>
               </div>`
            : `<div class="pj-card-materials no-material" title="No material allocated">
                 <i class="fa-solid fa-circle-exclamation"></i>
                 <span>No stock material linked</span>
               </div>`;

        return `
            <div class="pj-job-card ${themeClass}" data-job-id="${job.id}">
                <div class="pj-card-top-row">
                    <div class="pj-card-ids">
                        <span class="pj-card-job-num">${this.escapeHtml(job.job_number)}</span>
                        <span class="pj-card-order-num">${this.escapeHtml(job.order_number)}</span>
                    </div>
                    <span class="pj-stage-badge badge-${themeClass}">
                        ${this.escapeHtml(job.status_name)}
                    </span>
                </div>

                <div class="pj-card-customer-block">
                    <div class="pj-card-cust-name">${this.escapeHtml(job.customer_name)}</div>
                    <div class="pj-card-cust-phone">
                        <i class="fa-solid fa-phone"></i> ${this.escapeHtml(job.customer_mobile)}
                    </div>
                </div>

                <div class="pj-card-tags-row">
                    <span class="pj-tag-spec">
                        <i class="fa-solid fa-print"></i> ${this.escapeHtml(job.print_type_name)}
                    </span>
                    <span class="pj-tag-qty">${job.qty} pcs</span>
                </div>

                ${materialHtml}

                <div class="pj-card-bottom-row">
                    <div class="pj-card-date-info">
                        <i class="fa-regular fa-calendar"></i> ${this.escapeHtml(job.date_formatted)}
                    </div>
                    <div class="pj-card-btn-group">
                        <button type="button" class="pj-btn-icon-sm btn-action-details" data-job-id="${job.id}" title="View Details & History">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button type="button" class="pj-btn-icon-sm btn-action-allocate" data-job-id="${job.id}" title="Allocate Stock / Material">
                            <i class="fa-solid fa-boxes-stacked"></i>
                        </button>
                        <button type="button" class="pj-btn-icon-sm btn-action-status" data-job-id="${job.id}" title="Advance Production Status">
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
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
