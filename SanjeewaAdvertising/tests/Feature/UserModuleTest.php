<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Hash;
use Modules\User\Models\User;
use Modules\User\Models\UserLogin;
use Modules\User\Models\UserStatus;
use Tests\TestCase;

class UserModuleTest extends TestCase
{
    private UserStatus $status;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('migrate', ['--path' => 'Modules/User/database/migrations']);

        $this->status = UserStatus::firstOrCreate(
            ['user_status' => 'Active']
        );
    }

    public function test_auth_register_creates_new_user(): void
    {
        $unique = uniqid();
        $payload = [
            'first_name' => 'Sunil',
            'last_name' => 'Perera',
            'mobile' => '077'.rand(1000000, 9999999),
            'username' => 'sunil_'.$unique,
            'password' => 'Secret123!',
            'password_confirmation' => 'Secret123!',
            'user_statuses_id' => $this->status->id,
        ];

        $response = $this->postJson('/api/v1/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User registered successfully.',
            ])
            ->assertJsonPath('data.username', 'sunil_'.$unique);

        $this->assertDatabaseHas('users', [
            'username' => 'sunil_'.$unique,
            'first_name' => 'Sunil',
        ]);

        $user = User::where('username', 'sunil_'.$unique)->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('Secret123!', $user->password));
        $this->assertNotSame('Secret123!', $user->password);
        $this->assertStringStartsWith('$2y$', $user->password);
    }

    public function test_auth_login_with_valid_credentials(): void
    {
        $unique = uniqid();
        $mobile = '071'.rand(1000000, 9999999);
        $user = User::create([
            'first_name' => 'Kamal',
            'last_name' => 'Silva',
            'mobile' => $mobile,
            'username' => 'kamal_'.$unique,
            'password' => Hash::make('MyPassword123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $this->status->id,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'kamal_'.$unique,
            'password' => 'MyPassword123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful.',
            ])
            ->assertJsonPath('data.user.id', $user->id);

        $user->refresh();
        $this->assertSame(1, (int) $user->is_login);

        $this->assertDatabaseHas('user_login', [
            'user_id' => $user->id,
            'logout' => null,
        ]);
    }

    public function test_auth_login_with_invalid_credentials_returns_401(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'nonexistent_user',
            'password' => 'WrongPass',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid username or password.',
            ]);
    }

    public function test_auth_logout_updates_login_record_and_user_status(): void
    {
        $unique = uniqid();
        $user = User::create([
            'first_name' => 'Nimal',
            'last_name' => 'Bandara',
            'mobile' => '072'.rand(1000000, 9999999),
            'username' => 'nimal_'.$unique,
            'password' => Hash::make('Pass123'),
            'register_at' => now(),
            'is_login' => 1,
            'user_statuses_id' => $this->status->id,
        ]);

        $loginRecord = UserLogin::create([
            'user_id' => $user->id,
            'login' => now(),
            'logout' => null,
        ]);

        $response = $this->postJson('/api/v1/auth/logout', [
            'user_id' => $user->id,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);

        $user->refresh();
        $this->assertSame(0, (int) $user->is_login);

        $loginRecord->refresh();
        $this->assertNotNull($loginRecord->logout);
    }

    public function test_web_logout_redirects_to_login(): void
    {
        $unique = uniqid();
        $user = User::create([
            'first_name' => 'Web',
            'last_name' => 'User',
            'mobile' => '077'.rand(1000000, 9999999),
            'username' => 'webuser_'.$unique,
            'password' => Hash::make('Secret123'),
            'register_at' => now(),
            'is_login' => 1,
            'user_statuses_id' => $this->status->id,
        ]);

        $response = $this->actingAs($user)->post('/logout');

        $response->assertRedirect(route('login'));
        $this->assertGuest();

        // Also verify when authenticated as App\Models\User instance
        $appUser = \App\Models\User::find($user->id);
        $this->assertNotNull($appUser);
        $responseApp = $this->actingAs($appUser)->post('/logout');
        $responseApp->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_user_controller_crud(): void
    {
        $unique = uniqid();

        // 1. Create user
        $storeResponse = $this->postJson('/api/v1/users', [
            'first_name' => 'Kasun',
            'last_name' => 'Fernando',
            'mobile' => '075'.rand(1000000, 9999999),
            'username' => 'kasun_'.$unique,
            'password' => 'Password123',
            'user_statuses_id' => $this->status->id,
        ]);

        $storeResponse->assertStatus(201);
        $userId = $storeResponse->json('data.id');

        // 2. Show user
        $showResponse = $this->getJson("/api/v1/users/{$userId}");
        $showResponse->assertStatus(200)
            ->assertJsonPath('data.username', 'kasun_'.$unique);

        // 3. Update user
        $updateResponse = $this->putJson("/api/v1/users/{$userId}", [
            'first_name' => 'Kasun Updated',
        ]);
        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.first_name', 'Kasun Updated');

        // 4. Index listing
        $indexResponse = $this->getJson('/api/v1/users?search=Kasun');
        $indexResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        // 5. Update user status
        $statusResponse = $this->patchJson("/api/v1/users/{$userId}/status", [
            'user_statuses_id' => $this->status->id,
        ]);
        $statusResponse->assertStatus(200)
            ->assertJsonPath('data.status.id', $this->status->id);

        // 6. Delete user
        $deleteResponse = $this->deleteJson("/api/v1/users/{$userId}");
        $deleteResponse->assertStatus(200);

        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_user_resource_structure_and_login_history(): void
    {
        $unique = uniqid();
        $user = User::create([
            'first_name' => 'Ruwan',
            'last_name' => 'Perera',
            'mobile' => '078'.rand(1000000, 9999999),
            'username' => 'ruwan_'.$unique,
            'password' => Hash::make('Pass123'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $this->status->id,
        ]);

        UserLogin::create([
            'user_id' => $user->id,
            'login' => now()->subHour(),
            'logout' => now(),
        ]);

        $showResponse = $this->getJson("/api/v1/users/{$user->id}");
        $showResponse->assertStatus(200)
            ->assertJsonPath('data.full_name', 'Ruwan Perera')
            ->assertJsonPath('data.status.user_status', 'Active');

        $loginsResponse = $this->getJson("/api/v1/users/{$user->id}/logins");
        $loginsResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('pagination.total', 1);
    }

    public function test_get_all_users_without_pagination_limit(): void
    {
        $unique = uniqid();
        User::create([
            'first_name' => 'Alpha',
            'last_name' => 'User',
            'mobile' => '070'.rand(1000000, 9999999),
            'username' => 'alpha_'.$unique,
            'password' => 'PlainSecret123',
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $this->status->id,
        ]);

        User::create([
            'first_name' => 'Beta',
            'last_name' => 'User',
            'mobile' => '079'.rand(1000000, 9999999),
            'username' => 'beta_'.$unique,
            'password' => 'PlainSecret123',
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $this->status->id,
        ]);

        // 1. Test GET /api/v1/users/all
        $allResponse = $this->getJson('/api/v1/users/all');
        $allResponse->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertIsArray($allResponse->json('data'));
        $this->assertGreaterThanOrEqual(2, count($allResponse->json('data')));

        // 2. Test GET /api/v1/users?all=true
        $indexAllResponse = $this->getJson('/api/v1/users?all=true');
        $indexAllResponse->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertIsArray($indexAllResponse->json('data'));
    }

    public function test_search_users_across_name_username_mobile_and_status(): void
    {
        $unique = uniqid();
        $targetUser = User::create([
            'first_name' => 'Chamara',
            'last_name' => 'Jayasinghe',
            'mobile' => '076'.rand(1000000, 9999999),
            'username' => 'chamara_'.$unique,
            'password' => 'Password123!',
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => $this->status->id,
        ]);

        // Search by first name via /api/v1/users/search
        $searchResponse = $this->getJson('/api/v1/users/search?q=Chamara');
        $searchResponse->assertStatus(200)
            ->assertJsonPath('success', true);
        $this->assertSame($targetUser->id, $searchResponse->json('data.0.id'));

        // Search by full name "Chamara Jayasinghe"
        $fullNameSearch = $this->getJson('/api/v1/users/search?q=Chamara Jayasinghe&all=true');
        $fullNameSearch->assertStatus(200);
        $this->assertContains($targetUser->id, array_column($fullNameSearch->json('data'), 'id'));

        // Search by mobile
        $mobileSearch = $this->getJson("/api/v1/users?search={$targetUser->mobile}&all=true");
        $mobileSearch->assertStatus(200);
        $this->assertContains($targetUser->id, array_column($mobileSearch->json('data'), 'id'));
    }
}
