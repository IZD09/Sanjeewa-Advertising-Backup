/**
 * PrintJobStatusModal - Handles Status Advance and Production Transitions
 */
export class PrintJobStatusModal {
    constructor(dataLoader, options = {}) {
        this.dataLoader = dataLoader;
        this.onJobUpdated = options.onJobUpdated || (() => {});
        this.showToast = options.showToast || ((msg, type) => alert(msg));
        this.modal = document.getElementById('modalChangeStatus');
        this.currentJob = null;
        this.statuses = [];

        this.initEvents();
    }

    initEvents() {
        const btnSave = document.getElementById('btnSubmitStatusChange');
        if (btnSave) {
            btnSave.onclick = () => this.submit();
        }
    }

    setStatuses(statuses = []) {
        this.statuses = statuses;
        const select = document.getElementById('selectNewStatus');
        if (!select) return;

        select.innerHTML = '<option value="">-- Choose New Status --</option>' +
            statuses.map(s => `<option value="${s.id}">${this.escapeHtml(s.name)}</option>`).join('');
    }

    open(job) {
        this.currentJob = job;
        if (!this.modal || !job) return;

        const header = document.getElementById('statusJobHeader');
        if (header) header.textContent = `${job.job_number} • ${job.customer_name}`;

        const curBadge = document.getElementById('statusCurrentBadge');
        if (curBadge) {
            curBadge.textContent = job.status_name;
            curBadge.className = `pj-badge ${job.badge_class}`;
        }

        const select = document.getElementById('selectNewStatus');
        if (select) select.value = '';

        this.modal.classList.add('active');
    }

    close() {
        if (this.modal) this.modal.classList.remove('active');
        this.currentJob = null;
    }

    async submit() {
        if (!this.currentJob) return;
        const select = document.getElementById('selectNewStatus');
        const newStatusId = parseInt(select.value, 10);

        if (!newStatusId) {
            this.showToast('Please select a new production stage.', 'warning');
            return;
        }

        const btn = document.getElementById('btnSubmitStatusChange');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

        try {
            await this.dataLoader.updateStatus(this.currentJob.id, newStatusId);
            this.showToast(`Job ${this.currentJob.job_number} status updated successfully!`, 'success');
            this.close();
            this.onJobUpdated();
        } catch (err) {
            this.showToast(err.message || 'Failed to update status.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
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
