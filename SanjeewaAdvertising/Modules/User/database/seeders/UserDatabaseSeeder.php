<?php

namespace Modules\User\Database\Seeders;

use Database\Seeders\UserStatusSeeder;
use Illuminate\Database\Seeder;

class UserDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            UserStatusSeeder::class,
            SystemModuleSeeder::class,
        ]);
    }
}
