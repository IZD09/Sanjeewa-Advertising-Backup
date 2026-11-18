/**
 * PrintJobCardBuilder - Builds light-themed production job cards
 */
const STAGE_NEXT_BUTTON = {
    prepress: { label: 'Start Printing', icon: 'fa-print' },
    printing: { label: 'Move to Finishing', icon: 'fa-scissors' },
    finishing: { label: 'Mark Ready for Pickup', icon: 'fa-box-archive' },
    ready: { label: 'Mark Completed', icon: 'fa-circle-check' },
    completed: { label: 'Mark Delivered', icon: 'fa-truck-fast' },
};

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
        
        const activeStage = stageKey || job.stage_key;
        const matCount = (job.materials || []).length || (job.materials_count || 0);

        let materialHtml = '';
        if (matCount > 0) {
            materialHtml = `
                <div class="pj-card-materials has-material btn-action-allocate" data-job-id="${job.id}" style="cursor: pointer;" title="Allocated Materials (${matCount} items) - Click to view/add more">
                    <i class="fa-solid fa-boxes-stacked"></i>
                    <span class="pj-material-name">${this.escapeHtml(job.materials?.[0]?.name || 'Material')} ${matCount > 1 ? `(+${matCount - 1} more)` : ''}</span>
                    <span style="margin-left: auto; font-size: 10px; background: rgba(2, 132, 199, 0.15); color: #0284c7; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                        <i class="fa-solid fa-plus"></i> Add
                    </span>
                </div>
            `;
        } else if (activeStage === 'printing') {
            materialHtml = `
                <div class="pj-card-materials no-material btn-action-allocate" data-job-id="${job.id}" style="cursor: pointer; background: rgba(239, 68, 68, 0.08); border: 1px dashed #ef4444; color: #dc2626;" title="Click to select materials for this print">
                    <i class="fa-solid fa-boxes-stacked" style="color: #dc2626;"></i>
                    <span style="font-weight: 700;">+ Select Required Materials</span>
                </div>
            `;
        } else {
            materialHtml = `
                <div class="pj-card-materials no-material" title="No materials allocated">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>No materials allocated</span>
                </div>
            `;
        }

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
                        <button type="button" class="pj-btn-pill-allocate btn-action-allocate" data-job-id="${job.id}" title="Select / Add Materials" style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 6px; background: rgba(2, 132, 199, 0.1); border: 1px solid rgba(2, 132, 199, 0.3); color: #0284c7; cursor: pointer;">
                            <i class="fa-solid fa-boxes-stacked"></i>
                            <span>${matCount > 0 ? `${matCount} Mats` : 'Materials'}</span>
                        </button>
                    </div>
                </div>

                <div class="pj-card-advance-row">
                    ${(() => {
                        const isDelivered = String(job.status_name || '').toLowerCase().trim() === 'delivered';
                        if (isDelivered) {
                            return `<button type="button" class="pj-btn-advance-status btn-action-status" data-job-id="${job.id}" disabled>
                                <i class="fa-solid fa-check-double"></i> <span>Delivered</span>
                            </button>`;
                        }

                        if (activeStage === 'prepress') {
                            return `<button type="button" class="pj-btn-advance-status btn-action-status" data-job-id="${job.id}" title="Start Printing on Machine">
                                <i class="fa-solid fa-print"></i> <span>Start Printing</span> <i class="fa-solid fa-arrow-right"></i>
                            </button>`;
                        }

                        if (activeStage === 'printing') {
                            if (matCount === 0) {
                                return `<button type="button" class="pj-btn-advance-status btn-action-status btn-need-materials" data-job-id="${job.id}" title="Select materials before moving to Finishing">
                                    <i class="fa-solid fa-boxes-stacked"></i> <span>Select Materials to Finish</span> <i class="fa-solid fa-arrow-right"></i>
                                </button>`;
                            } else {
                                return `<button type="button" class="pj-btn-advance-status btn-action-status" data-job-id="${job.id}" title="Move to Finishing & Eyelets">
                                    <i class="fa-solid fa-scissors"></i> <span>Move to Finishing</span> <i class="fa-solid fa-arrow-right"></i>
                                </button>`;
                            }
                        }

                        const cfg = STAGE_NEXT_BUTTON[activeStage] || { label: 'Advance Production Status', icon: 'fa-forward-step' };
                        return `<button type="button" class="pj-btn-advance-status btn-action-status" data-job-id="${job.id}">
                            <i class="fa-solid ${cfg.icon}"></i> <span>${cfg.label}</span> <i class="fa-solid fa-arrow-right"></i>
                        </button>`;
                    })()}
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
