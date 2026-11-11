/**
 * PrintJobTableHandler - Manages the Data Table View, filtering, and pagination
 */
import { PrintJobTableBuilder } from "../builders/PrintJobTableBuilder.js";

export class PrintJobTableHandler {
    constructor(options = {}) {
        this.onViewDetails = options.onViewDetails || (() => {});
        this.onChangeStatus = options.onChangeStatus || (() => {});
        this.onAllocateStock = options.onAllocateStock || (() => {});

        this.tableBody = document.getElementById('pjTableBody');
        this.paginationInfo = document.getElementById('pjPaginationInfo');
        this.btnPrev = document.getElementById('pjBtnPrevPage');
        this.btnNext = document.getElementById('pjBtnNextPage');

        this.jobs = [];
        this.currentPage = 1;
        this.perPage = 10;

        if (this.btnPrev) {
            this.btnPrev.onclick = () => this.goToPage(this.currentPage - 1);
        }
        if (this.btnNext) {
            this.btnNext.onclick = () => this.goToPage(this.currentPage + 1);
        }
    }

    /**
     * Set jobs data and render first page
     * @param {Array} jobs 
     */
    setData(jobs = []) {
        this.jobs = jobs;
        this.currentPage = 1;
        this.render();
    }

    /**
     * Go to specific page
     * @param {number} page 
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.jobs.length / this.perPage) || 1;
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.render();
    }

    /**
     * Render current page rows
     */
    render() {
        if (!this.tableBody) return;

        if (this.jobs.length === 0) {
            this.tableBody.innerHTML = PrintJobTableBuilder.buildEmpty(8);
            if (this.paginationInfo) this.paginationInfo.textContent = 'Showing 0 of 0 jobs';
            if (this.btnPrev) this.btnPrev.disabled = true;
            if (this.btnNext) this.btnNext.disabled = true;
            return;
        }

        const totalPages = Math.ceil(this.jobs.length / this.perPage) || 1;
        const startIdx = (this.currentPage - 1) * this.perPage;
        const pageItems = this.jobs.slice(startIdx, startIdx + this.perPage);

        this.tableBody.innerHTML = pageItems.map(job => PrintJobTableBuilder.buildRow(job)).join('');

        const endIdx = Math.min(startIdx + this.perPage, this.jobs.length);
        if (this.paginationInfo) {
            this.paginationInfo.textContent = `Showing ${startIdx + 1} to ${endIdx} of ${this.jobs.length} jobs (Page ${this.currentPage} of ${totalPages})`;
        }

        if (this.btnPrev) this.btnPrev.disabled = (this.currentPage <= 1);
        if (this.btnNext) this.btnNext.disabled = (this.currentPage >= totalPages);

        this.attachRowEvents();
    }

    /**
     * Attach row action events
     */
    attachRowEvents() {
        if (!this.tableBody) return;

        this.tableBody.querySelectorAll('.btn-action-details').forEach(btn => {
            btn.onclick = () => {
                const jobId = parseInt(btn.getAttribute('data-job-id'), 10);
                this.onViewDetails(jobId);
            };
        });

        this.tableBody.querySelectorAll('.btn-action-status').forEach(btn => {
            btn.onclick = () => {
                const jobId = parseInt(btn.getAttribute('data-job-id'), 10);
                this.onChangeStatus(jobId);
            };
        });

        this.tableBody.querySelectorAll('.btn-action-allocate').forEach(btn => {
            btn.onclick = () => {
                const jobId = parseInt(btn.getAttribute('data-job-id'), 10);
                this.onAllocateStock(jobId);
            };
        });
    }
}
