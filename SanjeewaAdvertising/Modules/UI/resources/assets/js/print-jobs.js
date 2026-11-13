/**
 * Print Jobs Production Floor - Master Orchestrator (Ant Design / Gravity UI Style)
 * Sanjeewa Advertising Digital Printing Shop Management System
 *
 * Orchestrated modular architecture:
 * - Tab 1: Prepress & RIP (Design, Proofing & RIP Queue)
 * - Tab 2: Printing on Machine (Live Printer Production)
 * - Tab 3: Finishing & Eyelets (Lamination, Cutting, Eyelets, QC)
 * - Tab 4: Ready for Pickup (Packed, Ready on Shelf)
 * - Tab 5: Completed & Dispatched (Delivered, Invoiced & Archived)
 */

"use strict";

import {
    PrintJobDataLoader,
    PrintJobTabHandler,
    PrintJobTableHandler,
    PrintJobModalHandler,
    PrintJobFilterProcess,
    PrintJobExportProcess,
    PrintJobMetricsProcess
} from "./print-jobs/index.js";

export class PrintJobsManager {
    constructor() {
        this.dataLoader = new PrintJobDataLoader();

        // 1. Modals Orchestrator
        this.modalHandler = new PrintJobModalHandler(this.dataLoader, {
            onJobUpdated: () => this.reloadFloorData(),
            showToast: (msg, type) => this.showToast(msg, type)
        });

        // 2. 5 Light Color Tabs & Cards Handler
        this.tabHandler = new PrintJobTabHandler({
            onViewDetails: (jobId) => this.handleViewDetails(jobId),
            onChangeStatus: (jobId) => this.handleChangeStatus(jobId),
            onAllocateStock: (jobId) => this.handleAllocateStock(jobId)
        });

        // 3. Table Handler
        this.tableHandler = new PrintJobTableHandler({
            onViewDetails: (jobId) => this.handleViewDetails(jobId),
            onChangeStatus: (jobId) => this.handleChangeStatus(jobId),
            onAllocateStock: (jobId) => this.handleAllocateStock(jobId)
        });

        this.allJobs = [];
        this.filteredJobs = [];
        this.kanbanData = {};
        this.kpis = {};
        this.statuses = [];
        this.printTypes = [];
        this.availableStocks = [];

        this.initUI();
        this.loadInitialData();
    }

    initUI() {
        // View Mode Switcher (Tabs View vs Full Table View)
        const btnCards = document.getElementById('btnViewCards');
        const btnTable = document.getElementById('btnViewTable');
        const tabsWrap = document.getElementById('stageTabsContainer');
        const tableWrap = document.getElementById('tableViewContainer');

        if (btnCards && btnTable) {
            btnCards.onclick = () => {
                btnCards.classList.add('active');
                btnTable.classList.remove('active');
                if (tabsWrap) tabsWrap.style.display = 'block';
                if (tableWrap) tableWrap.style.display = 'none';
            };

            btnTable.onclick = () => {
                btnTable.classList.add('active');
                btnCards.classList.remove('active');
                if (tabsWrap) tabsWrap.style.display = 'none';
                if (tableWrap) tableWrap.style.display = 'block';
                this.tableHandler.render();
            };
        }

        // Live Search Input (Debounced)
        const searchInput = document.getElementById('jobSearchInput');
        if (searchInput) {
            let timeout = null;
            searchInput.oninput = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.applyFilters(), 250);
            };
        }

        // Category Filter
        const typeFilter = document.getElementById('filterPrintType');
        if (typeFilter) {
            typeFilter.onchange = () => this.applyFilters();
        }

        // Status Filter
        const statusFilter = document.getElementById('filterStatus');
        if (statusFilter) {
            statusFilter.onchange = () => this.applyFilters();
        }

        // Refresh Button
        const btnRefresh = document.getElementById('btnRefreshJobs');
        if (btnRefresh) {
            btnRefresh.onclick = () => this.reloadFloorData();
        }

        // Export Button
        const btnExport = document.getElementById('btnExportJobs');
        if (btnExport) {
            btnExport.onclick = () => this.exportCsv();
        }
    }

    loadInitialData() {
        if (window.__INITIAL_PRINT_JOBS_DATA__) {
            this.processFloorData(window.__INITIAL_PRINT_JOBS_DATA__);
        } else {
            this.reloadFloorData();
        }
    }

    async reloadFloorData() {
        try {
            const data = await this.dataLoader.fetchFloorData();
            this.processFloorData(data);
            this.showToast('Production floor data refreshed.', 'success');
        } catch (err) {
            this.showToast(err.message || 'Error refreshing floor data.', 'error');
        }
    }

    processFloorData(data) {
        this.allJobs = data.jobs || [];
        this.filteredJobs = [...this.allJobs];
        this.kanbanData = data.kanban || {};
        this.kpis = data.kpis || {};
        this.statuses = data.statuses || [];
        this.printTypes = data.print_types || [];
        this.availableStocks = data.available_stocks || [];

        // Reference data for modals
        this.modalHandler.setReferenceData(this.statuses, this.availableStocks);

        // Update KPIs
        PrintJobMetricsProcess.update(this.kpis);

        // Populate Selects
        this.populateDropdowns();

        // Render Cards & Table
        this.applyFilters();
    }

    populateDropdowns() {
        const typeSelect = document.getElementById('filterPrintType');
        if (typeSelect && this.printTypes && this.printTypes.length > 0) {
            const currentVal = typeSelect.value;
            typeSelect.innerHTML = '<option value="">All Categories</option>';
            this.printTypes.forEach(pt => {
                const opt = document.createElement('option');
                opt.value = pt.id;
                opt.textContent = pt.name;
                if (String(pt.id) === String(currentVal)) {
                    opt.selected = true;
                }
                typeSelect.appendChild(opt);
            });
        }

        const statusSelect = document.getElementById('filterStatus');
        if (statusSelect && this.statuses && this.statuses.length > 0) {
            const currentVal = statusSelect.value;
            statusSelect.innerHTML = '<option value="">All Statuses</option>';
            this.statuses.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                if (String(s.id) === String(currentVal)) {
                    opt.selected = true;
                }
                statusSelect.appendChild(opt);
            });
        }
    }

    applyFilters() {
        const query = document.getElementById('jobSearchInput')?.value || '';
        const typeId = document.getElementById('filterPrintType')?.value || '';
        const statusId = document.getElementById('filterStatus')?.value || '';

        const result = PrintJobFilterProcess.filter(this.allJobs, { query, typeId, statusId });
        this.filteredJobs = result.filteredJobs;

        // Render Tabs with cards
        this.tabHandler.render(result.kanbanGrouped);

        // Render Table
        this.tableHandler.setData(this.filteredJobs);
    }

    handleViewDetails(jobId) {
        const job = this.allJobs.find(j => j.id === jobId);
        if (job) this.modalHandler.openDetails(job);
    }

    handleChangeStatus(jobId) {
        const job = this.allJobs.find(j => j.id === jobId);
        if (job) this.modalHandler.openChangeStatus(job);
    }

    handleAllocateStock(jobId) {
        const job = this.allJobs.find(j => j.id === jobId);
        if (job) this.modalHandler.openAllocateMaterial(job);
    }

    exportCsv() {
        try {
            PrintJobExportProcess.exportToCsv(this.filteredJobs);
            this.showToast('Print jobs exported successfully.', 'success');
        } catch (err) {
            this.showToast(err.message, 'warning');
        }
    }

    showToast(message, type = 'info') {
        let toastContainer = document.getElementById('poToastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'poToastContainer';
            toastContainer.className = 'po-toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `po-toast ${type}`;
        const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info');
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${this.escapeHtml(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-8px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
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

// Global initialization
const bootPrintJobs = () => {
    if (document.getElementById('module-print-jobs')) {
        window.printJobsManager = new PrintJobsManager();
    }
};

bootPrintJobs();
document.addEventListener('DOMContentLoaded', bootPrintJobs);
document.addEventListener('turbo:load', bootPrintJobs);
