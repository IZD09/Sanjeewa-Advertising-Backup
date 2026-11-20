<?php

namespace Tests\Feature;

use Modules\Admin\Database\Seeders\AdminStatusSeeder;
use Modules\Admin\Database\Seeders\AdminTypeSeeder;
use Modules\Admin\Database\Seeders\DefaultAdminSeeder;
use Modules\Admin\Models\Admin;
use Modules\HR\Database\Seeders\HRDatabaseSeeder;
use Modules\HR\Models\Staff;
use Modules\HR\Models\StaffStatus;
use Modules\User\Database\Seeders\SystemModuleSeeder;
use Modules\User\Database\Seeders\UserStatusSeeder;
use Tests\TestCase;

class AdminHRManagementTest extends TestCase
{
    private Admin $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        $this->seed(UserStatusSeeder::class);
        $this->seed(AdminStatusSeeder::class);
        $this->seed(AdminTypeSeeder::class);
        $this->seed(SystemModuleSeeder::class);
        $this->seed(DefaultAdminSeeder::class);
        $this->seed(HRDatabaseSeeder::class);

        $this->admin = Admin::where('username', 'admin')->firstOrFail();
    }

    public function test_guest_is_redirected_when_accessing_hr_management_page(): void
    {
        $response = $this->get('/admin/hr-management');

        $response->assertRedirect('/admin/login');
    }

    public function test_short_hr_management_route_redirects_to_admin_hr_management(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->get('/hr-management');

        $response->assertRedirect(route('admin.hr-management'));
    }

    public function test_authenticated_admin_can_access_hr_management_page_with_sidebar_button_and_seeded_records(): void
    {
        $sampleStaff = Staff::query()->firstOrFail();

        $response = $this->actingAs($this->admin, 'admin')->get('/admin/hr-management');

        $response->assertStatus(200);
        $response->assertViewIs('ui::layouts.admin.pages.hr-management.hr-management');
        $response->assertViewHas('kpi', function (array $kpi): bool {
            return $kpi['total_staff'] === Staff::query()->count()
                && $kpi['total_staff'] > 0
                && $kpi['daily_salary_count'] > 0;
        });

        $response->assertSee('data-route="hr-management"', false);
        $response->assertSee('HR &amp; Payroll', false);
        $response->assertSee('id="module-hr-management"', false);
        $response->assertSee('id="kpiTodayDailyPayouts"', false);
        $response->assertSee('id="kpiTodayDailyPayoutsCount"', false);
        $response->assertSee('id="modalAddStaff"', false);
        $response->assertSee('hr-form-grid-single', false);
        $response->assertDontSee('id="hrStaffStatus"', false);
        $response->assertSee('id="modalSetSalary"', false);
        $response->assertSee('id="salaryStaffCombobox"', false);
        $response->assertSee('id="hrSalaryStaffSearch"', false);
        $response->assertSee('id="hrSalaryStaffResults"', false);
        $response->assertSee('id="modalPayDailySalary"', false);
        $response->assertSee('id="modalViewStaff"', false);
        $response->assertSee('id="modalChangeStaffStatus"', false);
        $response->assertSee('js-hr-change-status', false);
        $response->assertDontSee('<th>Base Salary</th>', false);
        $response->assertDontSee('<th>Added By</th>', false);
        $response->assertSee('id="dailySalaryStaffCombobox"', false);
        $response->assertSee('id="hrDailySalaryStaffSearch"', false);
        $response->assertSee('id="hrDailySalaryStaffResults"', false);
        $response->assertSee('id="hrDailySelectedSummary"', false);
        $response->assertSee('id="hrStaffPagination"', false);
        $response->assertSee('id="hrSalariesPagination"', false);
        $response->assertSee('id="hrDailySalariesPagination"', false);
        $response->assertSee('hr-daily-date-0', false);
        $response->assertDontSee('<span class="hr-dot"></span> Paid', false);
        $response->assertSee($sampleStaff->first_name);
    }

    public function test_admin_sidebar_renders_hr_management_button_on_other_admin_pages(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->get('/admin/profile');

        $response->assertStatus(200);
        $response->assertSee('data-route="hr-management"', false);
        $response->assertSee('HR &amp; Payroll', false);
    }

    public function test_guest_cannot_create_staff_member(): void
    {
        $response = $this->postJson('/admin/hr/staff', [
            'first_name' => 'Kamal',
            'last_name' => 'Perera',
            'nic' => '199912345678',
            'mobile' => '0771234567',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_admin_can_create_staff_member_with_default_active_status(): void
    {
        $activeStatusId = StaffStatus::where('staff_status', 'Active')->value('id');

        $response = $this->actingAs($this->admin, 'admin')->postJson('/admin/hr/staff', [
            'first_name' => '  Kamal  ',
            'last_name' => '  Perera  ',
            'nic' => ' 991234567v ',
            'mobile' => '0771234567',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Staff member added successfully.',
            ])
            ->assertJsonPath('data.first_name', 'Kamal')
            ->assertJsonPath('data.last_name', 'Perera')
            ->assertJsonPath('data.full_name', 'Kamal Perera')
            ->assertJsonPath('data.nic', '991234567V')
            ->assertJsonPath('data.mobile', '0771234567')
            ->assertJsonPath('data.staff_statuses_id', $activeStatusId)
            ->assertJsonPath('data.status.staff_status', 'Active')
            ->assertJsonPath('data.add_by', $this->admin->id);

        $this->assertDatabaseHas('staff', [
            'first_name' => 'Kamal',
            'last_name' => 'Perera',
            'nic' => '991234567V',
            'mobile' => '0771234567',
            'staff_statuses_id' => $activeStatusId,
            'add_by' => $this->admin->id,
        ]);
    }

    public function test_creating_staff_member_validates_required_fields_and_unique_nic(): void
    {
        $existingStaff = Staff::query()->firstOrFail();

        $missingResponse = $this->actingAs($this->admin, 'admin')->postJson('/admin/hr/staff', []);
        $missingResponse->assertStatus(422)
            ->assertJsonValidationErrors(['first_name', 'last_name', 'nic', 'mobile']);

        $duplicateNicResponse = $this->actingAs($this->admin, 'admin')->postJson('/admin/hr/staff', [
            'first_name' => 'Nimal',
            'last_name' => 'Silva',
            'nic' => $existingStaff->nic,
            'mobile' => '0779998888',
        ]);
        $duplicateNicResponse->assertStatus(422)
            ->assertJsonValidationErrors(['nic']);
    }

    public function test_authenticated_admin_can_list_and_show_staff_members(): void
    {
        $sampleStaff = Staff::query()->firstOrFail();

        $listResponse = $this->actingAs($this->admin, 'admin')->getJson('/admin/hr/staff');
        $listResponse->assertStatus(200)
            ->assertJson(['success' => true]);

        $showResponse = $this->actingAs($this->admin, 'admin')->getJson("/admin/hr/staff/{$sampleStaff->id}");
        $showResponse->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.id', $sampleStaff->id)
            ->assertJsonPath('data.nic', $sampleStaff->nic)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'full_name',
                    'nic',
                    'mobile',
                    'added_by',
                    'salaries',
                    'daily_salaries',
                    'payroll_summary' => [
                        'month_key',
                        'month_label',
                        'base_salary',
                        'month_daily_total',
                        'month_daily_count',
                        'month_remaining',
                    ],
                ],
            ]);
    }

    public function test_guest_cannot_set_base_salary(): void
    {
        $sampleStaff = Staff::query()->firstOrFail();

        $response = $this->postJson('/admin/hr/salaries', [
            'staff_id' => $sampleStaff->id,
            'amount' => 65000,
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_admin_can_set_base_salary_and_recalculate_payroll_total(): void
    {
        $sampleStaff = Staff::query()->firstOrFail();

        $response = $this->actingAs($this->admin, 'admin')->postJson('/admin/hr/salaries', [
            'staff_id' => $sampleStaff->id,
            'amount' => 72500.50,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Base salary updated successfully.',
            ])
            ->assertJsonPath('data.staff_id', $sampleStaff->id)
            ->assertJsonPath('data.amount', 72500.5)
            ->assertJsonPath('data.staff.nic', $sampleStaff->nic);

        $this->assertGreaterThan(0, (float) $response->json('data.monthly_payroll_total'));

        $this->assertDatabaseHas('salary', [
            'staff_id' => $sampleStaff->id,
            'amount' => 72500.50,
        ]);
    }

    public function test_setting_base_salary_validates_staff_and_positive_amount(): void
    {
        $missingResponse = $this->actingAs($this->admin, 'admin')->postJson('/admin/hr/salaries', []);
        $missingResponse->assertStatus(422)
            ->assertJsonValidationErrors(['staff_id', 'amount']);

        $sampleStaff = Staff::query()->firstOrFail();
        $zeroAmountResponse = $this->actingAs($this->admin, 'admin')->postJson('/admin/hr/salaries', [
            'staff_id' => $sampleStaff->id,
            'amount' => 0,
        ]);
        $zeroAmountResponse->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_authenticated_admin_can_list_base_salaries(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->getJson('/admin/hr/salaries');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_guest_cannot_record_daily_salary_payment(): void
    {
        $sampleStaff = Staff::query()->firstOrFail();

        $response = $this->postJson('/admin/hr/daily-salaries', [
            'staff_id' => $sampleStaff->id,
            'amount' => 2500,
            'pay_at' => now()->format('Y-m-d\TH:i'),
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_admin_can_record_daily_salary_payment(): void
    {
        $sampleStaff = Staff::query()->firstOrFail();
        $payAt = now()->format('Y-m-d\TH:i');

        $response = $this->actingAs($this->admin, 'admin')->postJson('/admin/hr/daily-salaries', [
            'staff_id' => $sampleStaff->id,
            'amount' => 3250.75,
            'pay_at' => $payAt,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Daily salary payment recorded successfully.',
            ])
            ->assertJsonPath('data.staff_id', $sampleStaff->id)
            ->assertJsonPath('data.amount', 3250.75)
            ->assertJsonPath('data.staff.nic', $sampleStaff->nic);

        $this->assertGreaterThan(0, (float) $response->json('data.daily_salary_total'));
        $this->assertGreaterThan(0, (int) $response->json('data.daily_salary_count'));
        $this->assertGreaterThanOrEqual(3250.75, (float) $response->json('data.today_daily_salary_total'));
        $this->assertGreaterThanOrEqual(1, (int) $response->json('data.today_daily_salary_count'));

        $this->assertDatabaseHas('daly_salary', [
            'staff_id' => $sampleStaff->id,
            'amount' => 3250.75,
        ]);
    }

    public function test_recording_daily_salary_validates_required_fields_and_positive_amount(): void
    {
        $missingResponse = $this->actingAs($this->admin, 'admin')->postJson('/admin/hr/daily-salaries', []);
        $missingResponse->assertStatus(422)
            ->assertJsonValidationErrors(['staff_id', 'amount', 'pay_at']);

        $sampleStaff = Staff::query()->firstOrFail();
        $zeroAmountResponse = $this->actingAs($this->admin, 'admin')->postJson('/admin/hr/daily-salaries', [
            'staff_id' => $sampleStaff->id,
            'amount' => 0,
            'pay_at' => now()->format('Y-m-d\TH:i'),
        ]);
        $zeroAmountResponse->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_authenticated_admin_can_list_daily_salaries(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->getJson('/admin/hr/daily-salaries');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_guest_cannot_update_staff_status(): void
    {
        $sampleStaff = Staff::query()->firstOrFail();
        $onLeaveStatusId = StaffStatus::where('staff_status', 'On Leave')->value('id');

        $response = $this->patchJson("/admin/hr/staff/{$sampleStaff->id}/status", [
            'staff_statuses_id' => $onLeaveStatusId,
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_admin_can_update_staff_status(): void
    {
        $sampleStaff = Staff::query()->firstOrFail();
        $suspendedStatus = StaffStatus::where('staff_status', 'Suspended')->firstOrFail();

        $response = $this->actingAs($this->admin, 'admin')->patchJson("/admin/hr/staff/{$sampleStaff->id}/status", [
            'staff_statuses_id' => $suspendedStatus->id,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Staff status updated successfully.',
            ])
            ->assertJsonPath('data.id', $sampleStaff->id)
            ->assertJsonPath('data.staff_statuses_id', $suspendedStatus->id)
            ->assertJsonPath('data.status.staff_status', 'Suspended');

        $this->assertNotNull($response->json('data.kpi_active_staff'));
        $this->assertNotNull($response->json('data.kpi_on_leave_staff'));

        $this->assertDatabaseHas('staff', [
            'id' => $sampleStaff->id,
            'staff_statuses_id' => $suspendedStatus->id,
        ]);
    }

    public function test_updating_staff_status_validates_status_and_handles_missing_staff(): void
    {
        $sampleStaff = Staff::query()->firstOrFail();

        $invalidResponse = $this->actingAs($this->admin, 'admin')->patchJson("/admin/hr/staff/{$sampleStaff->id}/status", [
            'staff_statuses_id' => 999999,
        ]);
        $invalidResponse->assertStatus(422)
            ->assertJsonValidationErrors(['staff_statuses_id']);

        $activeStatusId = StaffStatus::where('staff_status', 'Active')->value('id');
        $notFoundResponse = $this->actingAs($this->admin, 'admin')->patchJson('/admin/hr/staff/999999/status', [
            'staff_statuses_id' => $activeStatusId,
        ]);
        $notFoundResponse->assertStatus(404);
    }
}
