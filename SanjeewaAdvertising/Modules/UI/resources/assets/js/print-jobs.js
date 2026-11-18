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
import { ConfirmModalHelper } from "./core/ConfirmModalHelper.js";

export class PrintJobsManager {
    constructor() {
        this.dataLoader = new PrintJobDataLoader();

        // 1. Modals Orchestrator
        this.modalHandler = new PrintJobModalHandler(this.dataLoader, {
            onJobUpdated: () => this.reloadFloorData(true),
            onStartPrintingSuccess: async () => {
                await this.reloadFloorData(true);
                this.tabHandler.switchTab('printing');
            },
            showToast: (msg, type) => this.showToast(msg, type)
        });

        // 2. 5 Light Color Tabs & Cards Handler
        this.tabHandler = new PrintJobTabHandler({
            onViewDetails: (jobId) => this.handleViewDetails(jobId),
            onChangeStatus: (jobId) => this.handleAdvanceFromCard(jobId),
            onAllocateStock: (jobId) => this.handleAllocateStock(jobId)
        });

        // 3. Table Handler
        this.tableHandler = new PrintJobTableHandler({
            onViewDetails: (jobId) => this.handleViewDetails(jobId),
            onChangeStatus: (jobId) => this.handleChangeStatus(jobId),
            onAllocateStock: (jobId) => this.handleAllocateStock(jobId),
            onApproveJob: (jobId) => this.handleQuickStatusChange(jobId, 'Approved'),
            onCancelJob: (jobId) => {
                const job = this.allJobs.find(j => j.id === jobId);
                const label = job?.order_number || job?.job_number || `Job #${jobId}`;
                ConfirmModalHelper.openCancelOrderModal({
                    targetLabel: label,
                    onConfirm: () => this.handleQuickStatusChange(jobId, 'Cancelled')
                });
            }
        });

        this.allJobs = [];
        this.filteredJobs = [];
        this.kanbanData = {};
        this.kpis = {};
        this.statuses = [];
        this.printTypes = [];
        this.availableStocks = [];
        this._initializedEl = null;

        this.init();
    }

    init() {
        const moduleEl = document.getElementById('module-print-jobs');
        if (!moduleEl || this._initializedEl === moduleEl) {
            return;
        }
        this._initializedEl = moduleEl;

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

    async reloadFloorData(silent = false) {
        try {
            const data = await this.dataLoader.fetchFloorData();
            this.processFloorData(data);
            if (!silent) {
                this.showToast('Production floor data refreshed.', 'success');
            }
        } catch (err) {
            if (!silent) {
                this.showToast(err.message || 'Error refreshing floor data.', 'error');
            }
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
        this.materialCategories = data.material_categories || [];
        this.materialSubcategories = data.material_subcategories || [];

        // Reference data for modals
        this.modalHandler.setReferenceData(
            this.statuses,
            this.availableStocks,
            this.materialCategories,
            this.materialSubcategories
        );

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

    async handleAdvanceFromCard(jobId) {
        const job = this.allJobs.find(j => j.id === jobId);
        if (!job) return;

        // When in Printing on Machine, moving to Finishing requires materials to be selected
        if (job.stage_key === 'printing') {
            const hasMaterials = (job.materials || []).length > 0;
            if (!hasMaterials) {
                this.showToast('Please select the materials used for this print before moving to Finishing.', 'warning');
                this.modalHandler.openAllocateMaterial(job, { forStartPrinting: false });
                return;
            }
        }

        const nextStatusByStage = {
            prepress: 'Printing',
            printing: 'Finishing',
            finishing: 'Ready for Pickup',
            ready: 'Completed',
        };

        let targetStatus = nextStatusByStage[job.stage_key] || null;
        if (!targetStatus && job.stage_key === 'completed') {
            const isAlreadyDelivered = String(job.status_name || '').toLowerCase().trim() === 'delivered';
            if (!isAlreadyDelivered) {
                targetStatus = 'Delivered';
            }
        }

        if (targetStatus) {
            await this.handleQuickStatusChange(jobId, targetStatus);
            return;
        }

        this.modalHandler.openChangeStatus(job);
    }

    handleAllocateStock(jobId) {
        const job = this.allJobs.find(j => j.id === jobId);
        if (job) {
            this.modalHandler.openAllocateMaterial(job);
        }
    }

    async handleQuickStatusChange(jobId, targetStatusName) {
        const job = this.allJobs.find(j => j.id === jobId);

        // Guard: Moving to Finishing strictly requires at least one allocated material from Printing
        if (String(targetStatusName).toLowerCase() === 'finishing') {
            const hasMaterials = (job?.materials || []).length > 0;
            if (!hasMaterials) {
                this.showToast('Please select the materials used for this print before moving to Finishing.', 'warning');
                if (job) {
                    this.modalHandler.openAllocateMaterial(job, { forStartPrinting: false });
                }
                return;
            }
        }

        const statusObj = (this.statuses || []).find(
            s => String(s.name || '').toLowerCase().trim() === targetStatusName.toLowerCase()
        );

        if (!statusObj) {
            this.showToast(`Status "${targetStatusName}" not found.`, 'error');
            return;
        }

        try {
            await this.dataLoader.updateStatus(jobId, statusObj.id);
            this.showToast(`Job status updated to ${statusObj.name}.`, 'success');
            await this.reloadFloorData();
        } catch (err) {
            this.showToast(err.message || `Failed to mark job as ${targetStatusName}.`, 'error');
        }
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

if (typeof window !== 'undefined') {
    window.PrintJobsManager = PrintJobsManager;
}

bootPrintJobs();
document.addEventListener('DOMContentLoaded', bootPrintJobs);
document.addEventListener('turbo:load', bootPrintJobs);
