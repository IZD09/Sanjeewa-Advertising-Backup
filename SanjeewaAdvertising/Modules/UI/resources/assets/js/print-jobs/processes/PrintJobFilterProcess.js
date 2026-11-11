/**
 * PrintJobFilterProcess - Filters and partitions print jobs
 */
export class PrintJobFilterProcess {
    /**
     * Filter list of jobs and group by stage
     * @param {Array} jobs 
     * @param {Object} criteria { query, typeId, statusId }
     * @returns {Object} { filteredJobs, kanbanGrouped }
     */
    static filter(jobs = [], criteria = {}) {
        const query = (criteria.query || '').toLowerCase().trim();
        const typeId = criteria.typeId || '';
        const statusId = criteria.statusId || '';

        const filtered = jobs.filter(job => {
            if (query) {
                const matchId = String(job.id).includes(query) ||
                    job.job_number.toLowerCase().includes(query) ||
                    job.order_number.toLowerCase().includes(query);
                const matchCustomer = job.customer_name.toLowerCase().includes(query) ||
                    job.customer_mobile.includes(query);
                const matchType = job.print_type_name.toLowerCase().includes(query);

                if (!matchId && !matchCustomer && !matchType) return false;
            }

            if (typeId && String(job.print_types_id) !== String(typeId)) {
                return false;
            }

            if (statusId && String(job.status_id) !== String(statusId)) {
                return false;
            }

            return true;
        });

        const kanban = {
            prepress: [],
            printing: [],
            finishing: [],
            ready: [],
            completed: []
        };

        filtered.forEach(job => {
            if (kanban[job.stage_key]) {
                kanban[job.stage_key].push(job);
            }
        });

        return {
            filteredJobs: filtered,
            kanbanGrouped: kanban
        };
    }
}
