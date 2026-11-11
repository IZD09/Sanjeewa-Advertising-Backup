/**
 * PrintJobExportProcess - Handles CSV export of print jobs
 */
export class PrintJobExportProcess {
    /**
     * Export jobs list to CSV
     * @param {Array} jobs 
     */
    static exportToCsv(jobs = []) {
        if (!jobs || jobs.length === 0) {
            throw new Error('No jobs available to export.');
        }

        const headers = [
            'Job ID',
            'Order Number',
            'Customer Name',
            'Mobile',
            'Print Type',
            'Quantity',
            'Production Stage',
            'Total Amount (LKR)',
            'Paid Amount (LKR)',
            'Payment Status',
            'Order Date'
        ];

        const rows = jobs.map(j => [
            j.job_number,
            j.order_number,
            `"${(j.customer_name || '').replace(/"/g, '""')}"`,
            j.customer_mobile,
            `"${(j.print_type_name || '').replace(/"/g, '""')}"`,
            j.qty,
            `"${(j.status_name || '').replace(/"/g, '""')}"`,
            j.total_amount,
            j.paid_amount,
            j.payment_status,
            j.date_formatted
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `print_jobs_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
