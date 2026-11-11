<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Modules\Customer\Models\Customer;
use Modules\Design\Models\PrintType;
use Modules\Inventory\Models\Brand;
use Modules\Inventory\Models\Category;
use Modules\Inventory\Models\Stock;
use Modules\Inventory\Models\StockItem;
use Modules\Inventory\Models\Subcategory;
use Modules\PrintJob\Models\PrintJob;
use Modules\PrintJob\Models\PrintJobStatus;
use Modules\PrintJob\Models\PrintJobStatusHistory;
use Modules\Supplier\Models\Grn;
use Modules\User\Models\SystemModule;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class PrintJobsPageTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected PrintJob $job;

    protected Stock $stock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        // Create user status & user
        $status = UserStatus::create(['id' => 1, 'user_status' => 'Active']);
        $this->user = User::create([
            'first_name' => 'Operator',
            'last_name' => 'User',
            'mobile' => '0771234567',
            'register_at' => now(),
            'username' => 'operator_user',
            'password' => Hash::make('password123'),
            'is_login' => 0,
            'user_statuses_id' => $status->id,
        ]);

        // Permission for Print Jobs
        $module = SystemModule::create(['id' => 1, 'system_module' => 'Print Jobs']);
        $this->user->systemModules()->attach($module->id, [
            'view' => 1,
            'create' => 1,
            'edit' => 1,
            'delete' => 1,
            'export' => 1,
        ]);

        // Customer
        $customer = Customer::create([
            'id' => 1,
            'name' => 'John Doe',
            'mobile' => '0712345678',
            'email' => 'john@example.com',
            'register_at' => now(),
        ]);

        // Print Type
        $printType = PrintType::create([
            'id' => 1,
            'print_type' => 'Flex Banner',
        ]);

        // Print Job Statuses
        PrintJobStatus::create(['id' => 1, 'print_job_states' => 'Pending']);
        PrintJobStatus::create(['id' => 2, 'print_job_states' => 'Designing']);
        PrintJobStatus::create(['id' => 3, 'print_job_states' => 'Approved']);
        PrintJobStatus::create(['id' => 4, 'print_job_states' => 'Printing']);
        PrintJobStatus::create(['id' => 5, 'print_job_states' => 'Finishing']);
        PrintJobStatus::create(['id' => 6, 'print_job_states' => 'Ready for Pickup']);
        PrintJobStatus::create(['id' => 7, 'print_job_states' => 'Completed']);

        // Print Job
        $this->job = PrintJob::create([
            'id' => 1,
            'users_id' => $this->user->id,
            'customer_id' => $customer->id,
            'print_types_id' => $printType->id,
            'add_date' => now(),
            'qty' => 5,
        ]);

        PrintJobStatusHistory::create([
            'print_jobs_id' => $this->job->id,
            'print_job_statuses_id' => 1,
            'update_at' => now(),
        ]);

        // Category, Subcategory, Brand, StockItem, Stock
        $grn = Grn::create(['id' => 1, 'at_time' => now()]);
        $category = Category::create(['id' => 1, 'category' => 'Flex']);
        $subcategory = Subcategory::create(['id' => 1, 'subcategory' => 'Rolls', 'categories_id' => $category->id]);
        $brand = Brand::create(['id' => 1, 'brand' => '3M']);
        $stockItem = StockItem::create([
            'id' => 1,
            'name' => 'Frontlit Flex 380gsm',
            'subcategories_id' => $subcategory->id,
            'code' => 'MAT-FLX-01',
            'low_stock_qty' => 10,
            'reorder_qty' => 20,
        ]);

        $this->stock = Stock::create([
            'id' => 1,
            'stock_items_id' => $stockItem->id,
            'add_date' => now(),
            'qty' => 150,
            'price' => 65.00,
            'buy' => 45.00,
            'brands_id' => $brand->id,
            'grn_id' => $grn->id,
        ]);
    }

    public function test_print_jobs_floor_page_loads_successfully_for_authorized_user(): void
    {
        $response = $this->actingAs($this->user, 'web')->get('/print-jobs');

        $response->assertStatus(200);
        $response->assertSee('Print Jobs Production Floor');
        $response->assertSee('Stage Tabs View');
        $response->assertSee('Data Table');
        $response->assertSee('modalJobDetails');
        $response->assertSee('modalChangeStatus');
        $response->assertSee('modalAllocateMaterial');
    }

    public function test_floor_data_api_returns_structured_production_datasets(): void
    {
        $response = $this->actingAs($this->user, 'web')->getJson('/api/v1/print-jobs/floor-data');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'kpis' => ['total', 'active', 'prepress', 'printing', 'finishing', 'ready_completed'],
                'kanban' => ['prepress', 'printing', 'finishing', 'ready', 'completed'],
                'jobs',
                'statuses',
                'print_types',
                'available_stocks',
            ],
            'message',
        ]);
        $this->assertTrue($response->json('success'));
        $this->assertSame(1, $response->json('data.kpis.total'));
    }

    public function test_can_update_job_status_through_endpoint(): void
    {
        $response = $this->actingAs($this->user, 'web')->patchJson("/api/v1/print-jobs/{$this->job->id}/status", [
            'print_job_statuses_id' => 4,
        ]);

        $response->assertStatus(200);
        $this->assertTrue($response->json('success'));

        $this->assertDatabaseHas('print_job_status_history', [
            'print_jobs_id' => $this->job->id,
            'print_job_statuses_id' => 4,
        ]);
    }

    public function test_can_assign_and_remove_stock_item_allocation(): void
    {
        // Assign stock
        $assignResponse = $this->actingAs($this->user, 'web')->postJson("/api/v1/print-jobs/{$this->job->id}/stock-items", [
            'stock_id' => $this->stock->id,
            'qty' => 3,
        ]);

        $assignResponse->assertStatus(200);
        $this->assertDatabaseHas('print_jobs_stock_items', [
            'print_jobs_id' => $this->job->id,
            'stock_id' => $this->stock->id,
            'qty' => 3,
        ]);

        // Remove stock
        $removeResponse = $this->actingAs($this->user, 'web')->deleteJson("/api/v1/print-jobs/{$this->job->id}/stock-items/{$this->stock->id}");
        $removeResponse->assertStatus(200);
        $this->assertDatabaseMissing('print_jobs_stock_items', [
            'print_jobs_id' => $this->job->id,
            'stock_id' => $this->stock->id,
        ]);
    }
}
