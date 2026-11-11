/**
 * PrintJobModalHandler - Orchestrator for all print job modals
 */
import { PrintJobDetailsModal } from "./PrintJobDetailsModal.js";
import { PrintJobStatusModal } from "./PrintJobStatusModal.js";
import { PrintJobMaterialModal } from "./PrintJobMaterialModal.js";

export class PrintJobModalHandler {
    constructor(dataLoader, options = {}) {
        this.dataLoader = dataLoader;
        this.onJobUpdated = options.onJobUpdated || (() => {});
        this.showToast = options.showToast || ((msg, type) => alert(msg));

        // Sub-modals
        this.detailsModal = new PrintJobDetailsModal(this.dataLoader);
        this.statusModal = new PrintJobStatusModal(this.dataLoader, {
            onJobUpdated: this.onJobUpdated,
            showToast: this.showToast
        });
        this.materialModal = new PrintJobMaterialModal(this.dataLoader, {
            onJobUpdated: this.onJobUpdated,
            showToast: this.showToast
        });

        this.initGlobalEvents();
    }

    initGlobalEvents() {
        // Close Buttons
        document.querySelectorAll('.pj-modal-close, [data-modal-dismiss]').forEach(btn => {
            btn.onclick = () => this.closeAll();
        });

        // Click outside on overlays
        document.querySelectorAll('.pj-modal-overlay').forEach(overlay => {
            overlay.onclick = (e) => {
                if (e.target === overlay) this.closeAll();
            };
        });

        // Escape Key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAll();
        });
    }

    setReferenceData(statuses = [], stocks = []) {
        this.statusModal.setStatuses(statuses);
        this.materialModal.setAvailableStocks(stocks);
    }

    openDetails(job) {
        this.detailsModal.open(job);
    }

    openChangeStatus(job) {
        this.statusModal.open(job);
    }

    openAllocateMaterial(job) {
        this.materialModal.open(job);
    }

    closeAll() {
        this.detailsModal.close();
        this.statusModal.close();
        this.materialModal.close();
    }
}
