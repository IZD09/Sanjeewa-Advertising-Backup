<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Admin\Database\Seeders\AdminStatusSeeder;
use Modules\Admin\Database\Seeders\AdminTypeSeeder;
use Modules\Admin\Database\Seeders\DefaultAdminSeeder;
use Modules\Admin\Models\Admin;
use Modules\Transport\Database\Seeders\TransportDatabaseSeeder;
use Modules\Transport\Models\DesialPrice;
use Modules\Transport\Models\StaffType;
use Modules\Transport\Models\Transport;
use Modules\Transport\Models\Truck;
use Modules\Transport\Models\VehicleModel;
use Modules\User\Database\Seeders\SystemModuleSeeder;
use Modules\User\Database\Seeders\UserStatusSeeder;
use Modules\User\Models\User;
use Tests\TestCase;

class TransportModuleTest extends TestCase
{
    use RefreshDatabase;

    private Admin $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(UserStatusSeeder::class);
        $this->seed(AdminStatusSeeder::class);
        $this->seed(AdminTypeSeeder::class);
        $this->seed(SystemModuleSeeder::class);
        $this->seed(DefaultAdminSeeder::class);

        $this->admin = Admin::where('username', 'admin')->firstOrFail();
    }

    public function test_admin_can_access_transport_page_and_sees_sidebar_button(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->get('/admin/transport');

        $response->assertStatus(200)
            ->assertSee('id="module-transport"', false)
            ->assertSee('data-route="transport"', false)
            ->assertSee('Transport Management');
    }

    public function test_admin_can_fetch_transport_api_data(): void
    {
        $response = $this->actingAs($this->admin, 'admin')->getJson('/advertising/transport/data');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'kpi' => ['total_dispatches', 'in_transit', 'delivered_today', 'active_vehicles'],
                    'dispatches',
                    'vehicles',
                ],
            ]);
    }

    public function test_regular_staff_user_cannot_access_admin_only_transport_module(): void
    {
        $staff = User::create([
            'first_name' => 'Staff',
            'last_name' => 'Member',
            'mobile' => '0771122334',
            'register_at' => now(),
            'username' => 'staff_member',
            'password' => bcrypt('password123'),
            'is_login' => 0,
            'user_statuses_id' => 1,
        ]);

        // API access denied for regular staff
        $this->actingAs($staff, 'web')
            ->getJson('/advertising/transport/data')
            ->assertStatus(403);

        // Staff profile sidebar must not render Admin-only Transport button
        $profileResponse = $this->actingAs($staff, 'web')->get('/profile');
        $profileResponse->assertStatus(200)
            ->assertDontSee('data-route="transport"', false);
    }

    public function test_transport_tables_and_seeders_populate_all_records_and_relationships(): void
    {
        $this->seed(TransportDatabaseSeeder::class);

        $this->assertGreaterThanOrEqual(6, StaffType::query()->count());
        $this->assertGreaterThanOrEqual(5, VehicleModel::query()->count());
        $this->assertGreaterThanOrEqual(5, Truck::query()->count());
        $this->assertGreaterThanOrEqual(3, DesialPrice::query()->count());
        $this->assertGreaterThanOrEqual(4, Transport::query()->count());

        $sampleTrip = Transport::query()->with(['truck.vehicleModel', 'desialPrice', 'staff.staffType'])->first();
        $this->assertNotNull($sampleTrip);
        $this->assertNotNull($sampleTrip->truck?->vehicleModel?->mane);
        $this->assertNotNull($sampleTrip->desialPrice?->price);
        $this->assertSame('Driver', $sampleTrip->staff?->staffType?->staff_type);
    }

    public function test_admin_can_add_vehicle_assign_driver_dispatch_and_complete_trip_with_diesel(): void
    {
        // 1. Set Diesel Rate (Rs. 290.00 / L)
        $dieselResponse = $this->actingAs($this->admin, 'admin')
            ->postJson('/advertising/transport/diesel-prices', [
                'price' => 290.00,
                'add_date' => now()->toDateString(),
            ]);
        $dieselResponse->assertStatus(201)
            ->assertJsonPath('data.price', 290);
        $dieselId = $dieselResponse->json('data.id');

        // 2. Register Driver via Transport endpoint
        $driverResponse = $this->actingAs($this->admin, 'admin')
            ->postJson('/advertising/transport/drivers', [
                'first_name' => 'Nuwan',
                'last_name' => 'Perera',
                'nic' => '199412345678',
                'mobile' => '0778899001',
                'role' => 'Driver',
            ]);
        $driverResponse->assertStatus(201);
        $driverId = $driverResponse->json('data.id');

        // 3. Add New Vehicle with inline new VehicleModel
        $vehicleResponse = $this->actingAs($this->admin, 'admin')
            ->postJson('/advertising/transport/vehicles', [
                'register' => 'wp-cab-7788',
                'new_model_name' => 'Tata Xenon',
                'current_km' => 12500,
                'fuel_efficiency' => 10.5,
                'status' => 'Available',
            ]);
        $vehicleResponse->assertStatus(201)
            ->assertJsonPath('data.register', 'WP-CAB-7788')
            ->assertJsonPath('data.model_name', 'Tata Xenon');
        $truckId = $vehicleResponse->json('data.id');

        // 4. Assign Default Driver to Vehicle
        $assignResponse = $this->actingAs($this->admin, 'admin')
            ->patchJson("/advertising/transport/vehicles/{$truckId}/driver", [
                'staff_id' => $driverId,
            ]);
        $assignResponse->assertStatus(200)
            ->assertJsonPath('data.default_staff_id', $driverId)
            ->assertJsonPath('data.default_driver_name', 'Nuwan Perera');

        // 5. Start Transport Dispatch
        $dispatchResponse = $this->actingAs($this->admin, 'admin')
            ->postJson('/advertising/transport/trips', [
                'truck_id' => $truckId,
                'staff_id' => $driverId,
                'start' => now()->subHours(3)->format('Y-m-d H:i:s'),
                'start_km' => 12500,
                'desial_price_id' => $dieselId,
                'destination' => 'Galle Town - Lightbox Delivery',
                'notes' => 'Expressway delivery',
            ]);
        $dispatchResponse->assertStatus(201)
            ->assertJsonPath('data.status', 'In Transit');
        $tripId = $dispatchResponse->json('data.id');

        $this->assertDatabaseHas('truck', [
            'id' => $truckId,
            'status' => 'On Trip',
        ]);

        // 6. Complete Transport & Record Diesel Consumed (120 km, 11.5 L @ Rs. 290 = Rs. 3,335.00)
        $completeResponse = $this->actingAs($this->admin, 'admin')
            ->patchJson("/advertising/transport/trips/{$tripId}/complete", [
                'end' => now()->format('Y-m-d H:i:s'),
                'end_km' => 12620,
                'diesel_liters' => 11.5,
                'desial_price_id' => $dieselId,
                'notes' => 'Delivered safely, fuel receipt #4412',
            ]);

        $completeResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'Completed')
            ->assertJsonPath('data.distance_km', 120)
            ->assertJsonPath('data.diesel_liters', 11.5)
            ->assertJsonPath('data.diesel_cost', 3335);

        $this->assertDatabaseHas('transport', [
            'id' => $tripId,
            'junry' => 120,
            'diesel_liters' => 11.500,
            'diesel_cost' => 3335.00,
        ]);

        $this->assertDatabaseHas('truck', [
            'id' => $truckId,
            'current_km' => 12620,
            'status' => 'Available',
        ]);
    }
}
