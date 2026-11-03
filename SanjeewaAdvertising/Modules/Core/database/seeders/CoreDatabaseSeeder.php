<?php

namespace Modules\Core\Database\Seeders;

use Database\Seeders\ActivityTypeSeeder;
use Illuminate\Database\Seeder;

class CoreDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            ActivityTypeSeeder::class,
        ]);
    }
}
