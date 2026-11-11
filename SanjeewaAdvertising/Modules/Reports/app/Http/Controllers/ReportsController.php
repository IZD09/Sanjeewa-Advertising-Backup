<?php

namespace Modules\Reports\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Reports\Http\Requests\ReportFilterRequest;
use Modules\Reports\Services\ReportsService;

class ReportsController extends Controller
{
    public function __construct(
        public ReportsService $reportsService
    ) {}

    /**
     * Display the reports view (delegates to UI reports layout).
     */
    public function index()
    {
        $initialPayload = $this->reportsService->getAllData();

        return view('ui::layouts.pages.reports.reports', [
            'initialPayload' => $initialPayload,
            'kpis' => $initialPayload['kpis'],
            'chartPayload' => $initialPayload['charts'],
            'initialTables' => $initialPayload['tables'],
        ]);
    }

    /**
     * Fetch complete report data payload (KPIs, Charts, and initial Table records).
     */
    public function data(ReportFilterRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $payload = $this->reportsService->getAllData($filters);

        return response()->json($payload);
    }

    /**
     * Fetch executive summary KPI card data.
     */
    public function kpis(ReportFilterRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $kpis = $this->reportsService->getExecutiveKpis($filters);

        return response()->json([
            'success' => true,
            'kpis' => $kpis,
        ]);
    }

    /**
     * Fetch table data for a specific tab with advanced search, sorting, and pagination.
     */
    public function table(ReportFilterRequest $request, string $tab): JsonResponse
    {
        $filters = $request->validated();

        $tableData = match ($tab) {
            'sales' => $this->reportsService->getSalesOrdersTable($filters),
            'payments' => $this->reportsService->getPaymentsCashFlowTable($filters),
            'expenses', 'operating_expenses' => $this->reportsService->getOperatingExpensesTable($filters),
            'receivables' => $this->reportsService->getCustomerReceivablesTable($filters),
            'inventory' => $this->reportsService->getInventoryStockTable($filters),
            'suppliers' => $this->reportsService->getSupplierGrnTable($filters),
            'profit_loss', 'profitLoss' => $this->reportsService->getProfitLossTable($filters),
            default => null,
        };

        if ($tableData === null) {
            return response()->json([
                'success' => false,
                'message' => "Invalid report tab: {$tab}",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'tab' => $tab,
            'table' => $tableData,
        ]);
    }
}
