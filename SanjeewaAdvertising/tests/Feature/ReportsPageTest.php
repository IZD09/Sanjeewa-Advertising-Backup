<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Modules\Reports\Services\CustomerReceivablesReportService;
use Modules\Reports\Services\ExecutiveKpiReportService;
use Modules\Reports\Services\InventoryStockReportService;
use Modules\Reports\Services\PaymentsCashFlowReportService;
use Modules\Reports\Services\ProfitLossReportService;
use Modules\Reports\Services\ReportsService;
use Modules\Reports\Services\SalesOrdersReportService;
use Modules\Reports\Services\SupplierGrnReportService;
use Modules\User\Models\SystemModule;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class ReportsPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
    }

    public function test_reports_page_renders_successfully_with_all_tabs_and_kpis(): void
    {
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $user = User::create([
            'first_name' => 'Report',
            'last_name' => 'Manager',
            'mobile' => '0779999999',
            'register_at' => now(),
            'username' => 'report_admin',
            'password' => Hash::make('password123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $module = SystemModule::create(['id' => 1, 'system_module' => 'Reports']);
        $user->systemModules()->attach($module->id, [
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 1,
            'export' => 1,
        ]);

        $response = $this->actingAs($user, 'web')->get('/reports');

        $response->assertOk();
        $response->assertSee('Reports &amp; Financial Analytics Hub', false);
        $response->assertSee('Gross Billings');
        $response->assertSee('Operating Expenses');
        $response->assertSee('Net Operating Profit');
        $response->assertSee('Sales &amp; Orders', false);
        $response->assertSee('Payments &amp; Cash Flow', false);
        $response->assertSee('Customer Receivables');
        $response->assertSee('Inventory &amp; Stock', false);
        $response->assertSee('Supplier &amp; GRN', false);
        $response->assertSee('Profit &amp; Loss Statement', false);
        $response->assertSee('btnExportReportCSV');
        $response->assertSee('btnPrintReportPDF');
        $response->assertSee('btnToggleTableView');
        $response->assertSee('btnToggleChartView');
        $response->assertSee('Table View');
        $response->assertSee('Chart View');
        $response->assertSee('data-section-mode="table"', false);
        $response->assertSee('data-section-mode="chart"', false);
        $response->assertSee('reports-chart-data');
        // Selectable Single-Chart View controls & expanded charts
        $response->assertSee('rep-chart-selector-bar');
        $response->assertSee('rep-chart-select-btn');
        $response->assertSee('rep-chart-select-dropdown');
        $response->assertSee('rep-single-chart-pane');
        $response->assertSee('chartSalesTrend');
        $response->assertSee('chartSalesByCategory');
        $response->assertSee('chartOrderStatus');
        $response->assertSee('chartOrderVolumeTrend');
        $response->assertSee('chartCashFlowChannels');
        $response->assertSee('chartOperatingExpenses');
        $response->assertSee('chartOperatingExpensesStatus');
        $response->assertSee('chartPaymentMethods');
        $response->assertSee('chartNetCashFlowTrend');
        $response->assertSee('chartChannelDistribution');
        $response->assertSee('operatingExpensesTable');
        $response->assertSee('Operating Expenses &amp; Utility Bills Breakdown', false);
        $response->assertSee('chartReceivablesAging');
        $response->assertSee('chartCustomerBalances');
        $response->assertSee('chartReceivablesStatus');
        $response->assertSee('chartStockValuation');
        $response->assertSee('chartStockHealth');
        $response->assertSee('chartStockPriceComparison');
        $response->assertSee('chartSupplierPayables');
        $response->assertSee('chartSupplierShare');
        $response->assertSee('chartSupplierSettlementRate');
        $response->assertSee('chartProfitLossSummary');
        $response->assertSee('chartExpenseBreakdown');
        $response->assertSee('chartProfitMarginTrend');
        // Table Sorting controls
        $response->assertSee('rep-sortable');
        $response->assertSee('rep-sort-select');
        $response->assertSee('rep-btn-reset-table');
        // Table Pagination controls
        $response->assertSee('rep-pagination-wrap');
        $response->assertSee('salesPaginationControls');
        $response->assertSee('cashFlowPaginationControls');
        $response->assertSee('operatingExpensesPaginationControls');
        $response->assertSee('receivablesPaginationControls');
        $response->assertSee('inventoryPaginationControls');
        $response->assertSee('suppliersPaginationControls');
    }

    public function test_reports_data_endpoint_returns_json_payload(): void
    {
        $status = UserStatus::create(['id' => 2, 'user_status' => 'Active2']);
        $user = User::create([
            'first_name' => 'Report',
            'last_name' => 'Tester',
            'mobile' => '0778888888',
            'register_at' => now(),
            'username' => 'report_tester',
            'password' => Hash::make('password123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $module = SystemModule::create(['id' => 2, 'system_module' => 'Reports']);
        $user->systemModules()->attach($module->id, [
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 1,
            'export' => 1,
        ]);

        $response = $this->actingAs($user, 'web')->getJson('/reports/data?preset=this_month');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'kpis' => [
                'grossBillings',
                'grnPurchases',
                'operatingExpenses',
                'netProfit',
                'uncollected',
            ],
            'charts',
            'tables' => [
                'sales',
                'payments',
                'receivables',
                'inventory',
                'suppliers',
                'profitLoss',
            ],
            'date_range',
        ]);
    }

    public function test_reports_table_endpoint_returns_paginated_table(): void
    {
        $status = UserStatus::first() ?: UserStatus::create(['id' => 3, 'user_status' => 'Active3']);
        $user = User::create([
            'first_name' => 'Table',
            'last_name' => 'Tester',
            'mobile' => '0777777777',
            'register_at' => now(),
            'username' => 'table_tester',
            'password' => Hash::make('password123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $module = SystemModule::firstWhere('system_module', 'Reports') ?: SystemModule::create(['id' => 3, 'system_module' => 'Reports']);
        $user->systemModules()->attach($module->id, [
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 1,
            'export' => 1,
        ]);

        $response = $this->actingAs($user, 'web')->getJson('/reports/table/sales?page=1&per_page=10');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'tab',
            'table' => [
                'data',
                'current_page',
                'per_page',
                'total',
                'last_page',
            ],
        ]);
    }

    public function test_reports_kpis_endpoint_returns_kpi_metrics(): void
    {
        $status = UserStatus::first() ?: UserStatus::create(['id' => 4, 'user_status' => 'Active4']);
        $user = User::create([
            'first_name' => 'Kpi',
            'last_name' => 'Tester',
            'mobile' => '0776666666',
            'register_at' => now(),
            'username' => 'kpi_tester',
            'password' => Hash::make('password123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $module = SystemModule::firstWhere('system_module', 'Reports') ?: SystemModule::create(['id' => 4, 'system_module' => 'Reports']);
        $user->systemModules()->attach($module->id, [
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 1,
            'export' => 1,
        ]);

        $response = $this->actingAs($user, 'web')->getJson('/reports/kpis?preset=this_month');

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'kpis' => [
                'grossBillings',
                'grnPurchases',
                'operatingExpenses',
                'netProfit',
                'uncollected',
            ],
        ]);
    }

    public function test_reports_tables_endpoints_return_valid_data_for_all_tabs(): void
    {
        $status = UserStatus::first() ?: UserStatus::create(['id' => 5, 'user_status' => 'Active5']);
        $user = User::create([
            'first_name' => 'AllTabs',
            'last_name' => 'Tester',
            'mobile' => '0775555555',
            'register_at' => now(),
            'username' => 'alltabs_tester',
            'password' => Hash::make('password123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        $module = SystemModule::firstWhere('system_module', 'Reports') ?: SystemModule::create(['id' => 5, 'system_module' => 'Reports']);
        $user->systemModules()->attach($module->id, [
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 1,
            'export' => 1,
        ]);

        $tabs = ['payments', 'expenses', 'receivables', 'inventory', 'suppliers'];
        foreach ($tabs as $tab) {
            $response = $this->actingAs($user, 'web')->getJson("/reports/table/{$tab}?page=1&per_page=10");
            $response->assertOk();
            $response->assertJsonStructure([
                'success',
                'tab',
                'table' => [
                    'data',
                    'current_page',
                    'per_page',
                    'total',
                    'last_page',
                ],
            ]);
        }
    }

    public function test_reports_service_subclasses_resolve_and_return_database_charts(): void
    {
        /** @var ReportsService $reportsService */
        $reportsService = app(ReportsService::class);

        $this->assertInstanceOf(ReportsService::class, $reportsService);
        $this->assertInstanceOf(ExecutiveKpiReportService::class, $reportsService->executiveKpis);
        $this->assertInstanceOf(SalesOrdersReportService::class, $reportsService->salesOrders);
        $this->assertInstanceOf(PaymentsCashFlowReportService::class, $reportsService->paymentsCashFlow);
        $this->assertInstanceOf(CustomerReceivablesReportService::class, $reportsService->customerReceivables);
        $this->assertInstanceOf(InventoryStockReportService::class, $reportsService->inventoryStock);
        $this->assertInstanceOf(SupplierGrnReportService::class, $reportsService->supplierGrn);
        $this->assertInstanceOf(ProfitLossReportService::class, $reportsService->profitLoss);

        $charts = $reportsService->getChartPayload(['preset' => 'this_month']);

        $this->assertArrayHasKey('salesTrend', $charts);
        $this->assertArrayHasKey('salesCategories', $charts);
        $this->assertArrayHasKey('orderStatus', $charts);
        $this->assertArrayHasKey('cashFlow', $charts);
        $this->assertArrayHasKey('operatingExpensesByCategory', $charts);
        $this->assertArrayHasKey('operatingExpensesStatus', $charts);
        $this->assertArrayHasKey('paymentMethods', $charts);
        $this->assertArrayHasKey('channelDistribution', $charts);
        $this->assertArrayHasKey('receivablesAging', $charts);
        $this->assertArrayHasKey('topCustomers', $charts);
        $this->assertArrayHasKey('receivablesStatus', $charts);
        $this->assertArrayHasKey('stockValuation', $charts);
        $this->assertArrayHasKey('stockHealth', $charts);
        $this->assertArrayHasKey('stockPriceComparison', $charts);
        $this->assertArrayHasKey('suppliers', $charts);
        $this->assertArrayHasKey('profitLoss', $charts);
        $this->assertArrayHasKey('expensesBreakdown', $charts);
        $this->assertArrayHasKey('profitMarginTrend', $charts);
    }
}
