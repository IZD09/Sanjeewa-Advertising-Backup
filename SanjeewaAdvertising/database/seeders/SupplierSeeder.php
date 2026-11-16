<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Supplier\Models\Supplier;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'PaperPro Lanka (Pvt) Ltd',
                'mobile' => '0772233445',
                'email' => 'sales@paperpro.lk',
                'bank_account' => 'BOC - 0019283746 (Colombo 03)',
                'status' => 'Active',
            ],
            [
                'name' => 'Lanka Vinyl & Sign Supplies',
                'mobile' => '0713344556',
                'email' => 'info@lankavinyl.lk',
                'bank_account' => 'Sampath - 102938475612 (Pettah)',
                'status' => 'Active',
            ],
            [
                'name' => 'ColorTech Eco-Solvent Inks',
                'mobile' => '0764455667',
                'email' => 'orders@colortech.lk',
                'bank_account' => 'Commercial - 8001234567 (Nugegoda)',
                'status' => 'Active',
            ],
            [
                'name' => 'Ceylon Flex & Banner House',
                'mobile' => '0775566778',
                'email' => 'sales@ceylonflex.lk',
                'bank_account' => 'HNB - 003020104050 (Kollupitiya)',
                'status' => 'Active',
            ],
            [
                'name' => 'Metro Rigid Boards & Acrylics',
                'mobile' => '0716677889',
                'email' => 'accounts@metrorigid.lk',
                'bank_account' => 'NDB - 104000234567 (Maharagama)',
                'status' => 'Active',
            ],
            [
                'name' => 'Prime Display Hardware Lanka',
                'mobile' => '0767788990',
                'email' => 'orders@primedisplay.lk',
                'bank_account' => 'Seylan - 008012345678 (Bambalapitiya)',
                'status' => 'Active',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::updateOrCreate(
                ['name' => $supplier['name']],
                [
                    'mobile' => $supplier['mobile'],
                    'email' => $supplier['email'],
                    'bank_account' => $supplier['bank_account'],
                    'status' => $supplier['status'],
                ]
            );
        }
    }
}
