/**
 * PrintJobTabHandler - Controls the 5 Light Color Tabs and their Card Grids
 */
import { PrintJobCardBuilder } from "../builders/PrintJobCardBuilder.js";

export class PrintJobTabHandler {
    constructor(options = {}) {
        this.onViewDetails = options.onViewDetails || (() => {});
        this.onChangeStatus = options.onChangeStatus || (() => {});
        this.onAllocateStock = options.onAllocateStock || (() => {});

        this.currentStage = 'prepress';

        this.stages = ['prepress', 'printing', 'finishing', 'ready', 'completed'];

        this.initTabs();
    }

    initTabs() {
        const tabNav = document.getElementById('pjStageTabs');
        if (!tabNav) return;

        tabNav.querySelectorAll('.pj-stage-tab').forEach(btn => {
            btn.onclick = () => {
                const stage = btn.getAttribute('data-stage');
                if (stage) this.switchTab(stage);
            };
        });
    }

    switchTab(stage) {
        if (!this.stages.includes(stage)) return;
        this.currentStage = stage;

        // Update tab buttons
        document.querySelectorAll('#pjStageTabs .pj-stage-tab').forEach(btn => {
            if (btn.getAttribute('data-stage') === stage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update tab panes
        document.querySelectorAll('.pj-tab-pane').forEach(pane => {
            if (pane.id === `tabPane-${stage}`) {
                pane.classList.add('active');
                pane.style.display = 'grid';
            } else {
                pane.classList.remove('active');
                pane.style.display = 'none';
            }
        });
    }

    /**
     * Render the jobs dataset across the 5 tabs
     * @param {Object} kanbanData Grouped jobs by stage
     */
    render(kanbanData = {}) {
        this.stages.forEach(stage => {
            const container = document.getElementById(`tabCards-${stage}`);
            const badge = document.getElementById(`tabBadge-${stage}`);
            const jobs = kanbanData[stage] || [];

            // Update badge
            if (badge) {
                badge.textContent = jobs.length;
            }

            if (!container) return;

            if (jobs.length === 0) {
                container.innerHTML = `
                    <div class="pj-tab-empty">
                        <i class="fa-solid fa-inbox"></i>
                        <div class="pj-empty-title">No jobs in this stage</div>
                        <div class="pj-empty-sub">Jobs assigned to this production stage will appear here.</div>
                    </div>
                `;
                return;
            }

            container.innerHTML = jobs.map(job => PrintJobCardBuilder.build(job, stage)).join('');
        });

        this.attachCardEvents();
    }

    attachCardEvents() {
        document.querySelectorAll('.pj-job-card .btn-action-details').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const jobId = parseInt(btn.getAttribute('data-job-id'), 10);
                this.onViewDetails(jobId);
            };
        });

        document.querySelectorAll('.pj-job-card .btn-action-status').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const jobId = parseInt(btn.getAttribute('data-job-id'), 10);
                this.onChangeStatus(jobId);
            };
        });

        document.querySelectorAll('.pj-job-card .btn-action-allocate').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const jobId = parseInt(btn.getAttribute('data-job-id'), 10);
                this.onAllocateStock(jobId);
            };
        });
    }
}
