<?php

namespace Modules\Reports\Services;

use Modules\Reports\Transactions\FetchReportDataTransaction;

class ReportsService extends BaseReportService
{
    public function __construct(
        public FetchReportDataTransaction $transaction,
        public ExecutiveKpiReportService $executiveKpis,
        public SalesOrdersReportService $salesOrders,
        public PaymentsCashFlowReportService $paymentsCashFlow,
        public CustomerReceivablesReportService $customerReceivables,
        public InventoryStockReportService $inventoryStock,
        public SupplierGrnReportService $supplierGrn,
        public ProfitLossReportService $profitLoss
    ) {
        parent::__construct($transaction);
    }

    /**
     * Get 5 Executive KPI metrics with formatted values and comparison labels.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, array<string, mixed>>
     */
    public function getExecutiveKpis(array $filters = []): array
    {
        return $this->executiveKpis->getExecutiveKpis($filters);
    }

    /**
     * Build dynamic chart payload for all report modules loaded directly from the database.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getChartPayload(array $filters = []): array
    {
        return array_merge(
            $this->salesOrders->getCharts($filters),
            $this->paymentsCashFlow->getCharts($filters),
            $this->customerReceivables->getCharts($filters),
            $this->inventoryStock->getCharts($filters),
            $this->supplierGrn->getCharts($filters),
            $this->profitLoss->getCharts($filters)
        );
    }

    /**
     * Get paginated, searchable, sorted Sales Orders.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getSalesOrdersTable(array $filters = []): array
    {
        return $this->salesOrders->getSalesOrdersTable($filters);
    }

    /**
     * Get paginated, searchable, sorted Payments & Cash Flow records (Multi-channel ledger).
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getPaymentsCashFlowTable(array $filters = []): array
    {
        return $this->paymentsCashFlow->getPaymentsCashFlowTable($filters);
    }

    /**
     * Get paginated, searchable, sorted Operating Expenses detailed table.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getOperatingExpensesTable(array $filters = []): array
    {
        return $this->paymentsCashFlow->getOperatingExpensesTable($filters);
    }

    /**
     * Get paginated Customer Receivables table.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getCustomerReceivablesTable(array $filters = []): array
    {
        return $this->customerReceivables->getCustomerReceivablesTable($filters);
    }

    /**
     * Get paginated Inventory & Stock table.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getInventoryStockTable(array $filters = []): array
    {
        return $this->inventoryStock->getInventoryStockTable($filters);
    }

    /**
     * Get paginated Supplier & GRN table.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getSupplierGrnTable(array $filters = []): array
    {
        return $this->supplierGrn->getSupplierGrnTable($filters);
    }

    /**
     * Get Profit & Loss Statement table rows.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getProfitLossTable(array $filters = []): array
    {
        return $this->profitLoss->getProfitLossTable($filters);
    }

    /**
     * Combined method for loading all report data asynchronously.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getAllData(array $filters = []): array
    {
        return [
            'success' => true,
            'kpis' => $this->getExecutiveKpis($filters),
            'charts' => $this->getChartPayload($filters),
            'tables' => [
                'sales' => $this->getSalesOrdersTable($filters),
                'payments' => $this->getPaymentsCashFlowTable($filters),
                'expenses' => $this->getOperatingExpensesTable($filters),
                'receivables' => $this->getCustomerReceivablesTable($filters),
                'inventory' => $this->getInventoryStockTable($filters),
                'suppliers' => $this->getSupplierGrnTable($filters),
                'profitLoss' => $this->getProfitLossTable($filters),
            ],
            'date_range' => [
                'preset' => $filters['preset'] ?? 'this_month',
                'date_from' => $filters['date_from'] ?? null,
                'date_to' => $filters['date_to'] ?? null,
            ],
        ];
    }
}
