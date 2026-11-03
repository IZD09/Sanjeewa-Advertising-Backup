<?php

namespace Modules\User\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\User\Models\SystemModule;

class SystemModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            'Dashboard',
            'Print Jobs',
            'Design Management',
            'Place Order',
            'Customers',
            'Quotations & Invoices',
            'Inventory',
            'GRN & Purchase Orders',
            'Payments & Financials',
            'Reports',
            'User Control',
            'Settings',
        ];

        foreach ($modules as $module) {
            SystemModule::firstOrCreate(['system_module' => $module]);
        }
    }
}
