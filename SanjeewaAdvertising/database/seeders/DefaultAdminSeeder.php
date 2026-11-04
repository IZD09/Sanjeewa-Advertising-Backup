<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\Admin;
use Modules\Admin\Models\AdminStatus;
use Modules\Admin\Models\AdminType;
use Modules\User\Models\PermisionState;
use Modules\User\Models\SystemModule;
use Modules\User\Models\SystemModuleUser;
use Modules\User\Models\User;
use Modules\User\Models\UserStatus;

class DefaultAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Provision Default Administrator in `admins` table
        $superAdminType = AdminType::firstOrCreate(['admin_type' => 'Super Admin']);
        $activeAdminStatus = AdminStatus::firstOrCreate(['admin_statas' => 'Active']);

        Admin::updateOrCreate(
            ['username' => 'admin'],
            [
                'first_name' => 'System',
                'last_name' => 'Admin',
                'password' => Hash::make('admin'),
                'email' => 'admin@sanjeewaadvertising.com',
                'mobile' => '0770000000',
                'add_time' => now(),
                'is_log' => 0,
                'admin_statuses_id' => $activeAdminStatus->id,
                'admin_types_id' => $superAdminType->id,
            ]
        );

        // 2. Provision Default Administrator in `users` table for universal auth and permission control
        $activeUserStatus = UserStatus::firstOrCreate(['user_status' => 'Active']);

        $userAdmin = User::updateOrCreate(
            ['username' => 'admin'],
            [
                'first_name' => 'System',
                'last_name' => 'Admin',
                'password' => Hash::make('admin'),
                'mobile' => '0770000000',
                'register_at' => now(),
                'is_login' => 0,
                'user_statuses_id' => $activeUserStatus->id,
            ]
        );

        // 3. Grant Full Access permissions for all modules in `system_modules_has_users`
        $fullAccessState = PermisionState::firstOrCreate(['permision_states' => 'Full Access']);
        $modules = SystemModule::all();

        foreach ($modules as $module) {
            SystemModuleUser::updateOrCreate(
                [
                    'system_modules_id' => $module->id,
                    'users_id' => $userAdmin->id,
                ],
                [
                    'permision_stateses_id' => $fullAccessState->id,
                ]
            );
        }
    }
}
