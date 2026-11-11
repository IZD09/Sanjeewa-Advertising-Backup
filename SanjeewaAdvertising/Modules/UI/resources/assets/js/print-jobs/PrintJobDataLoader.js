/**
 * PrintJobDataLoader - Handles all backend communication for Print Jobs module
 */
export class PrintJobDataLoader {
    constructor() {
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    /**
     * Get default headers for API requests
     */
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': this.csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
        };
    }

    /**
     * Fetch complete production floor dataset
     * @param {Object} params 
     */
    async fetchFloorData(params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = `/print-jobs/floor-data${query ? '?' + query : ''}`;
        const response = await fetch(url, { credentials: 'same-origin', headers: this.getHeaders() });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to fetch production floor data.');
        }
        return result.data;
    }

    /**
     * Update job production status
     * @param {number} jobId 
     * @param {number} statusId 
     */
    async updateStatus(jobId, statusId) {
        const url = `/print-jobs/${jobId}/status`;
        const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: this.getHeaders(),
            body: JSON.stringify({ print_job_statuses_id: statusId })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to update job status.');
        }
        return result.data;
    }

    /**
     * Fetch status history for a job
     * @param {number} jobId 
     */
    async fetchStatusHistory(jobId) {
        const url = `/print-jobs/${jobId}/status-history`;
        const response = await fetch(url, { credentials: 'same-origin', headers: this.getHeaders() });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to load status history.');
        }
        return result.data;
    }

    /**
     * Assign material/stock item to job
     * @param {number} jobId 
     * @param {number} stockId 
     * @param {number} qty 
     */
    async assignStockItem(jobId, stockId, qty) {
        const url = `/print-jobs/${jobId}/stock-items`;
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: this.getHeaders(),
            body: JSON.stringify({ stock_id: stockId, qty: qty })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to assign stock item.');
        }
        return result.data;
    }

    /**
     * Remove material/stock item from job
     * @param {number} jobId 
     * @param {number} stockId 
     */
    async removeStockItem(jobId, stockId) {
        const url = `/print-jobs/${jobId}/stock-items/${stockId}`;
        const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: this.getHeaders()
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to remove stock item.');
        }
        return result.data;
    }
}
