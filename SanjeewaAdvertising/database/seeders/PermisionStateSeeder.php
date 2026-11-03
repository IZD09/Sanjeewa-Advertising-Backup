<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\User\Models\PermisionState;

class PermisionStateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $states = [
            'Full Access',
            'Read Only',
            'Restricted',
            'Denied',
        ];

        foreach ($states as $state) {
            PermisionState::firstOrCreate(['permision_states' => $state]);
        }
    }
}
