<?php

namespace Modules\PrintJob\Database\Seeders;

use Database\Seeders\PrintJobStatusSeeder;
use Illuminate\Database\Seeder;

class PrintJobDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            PrintJobStatusSeeder::class,
        ]);
    }
}
