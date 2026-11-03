<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Transaction\Models\PaymentStatus;
use Modules\Transaction\Models\PaymentType;

class PaymentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'Cash',
            'Bank Transfer',
            'Credit Card',
            'Debit Card',
            'Cheque',
            'Online / QR Payment',
        ];

        foreach ($types as $type) {
            PaymentType::firstOrCreate(['payment_type' => $type]);
        }

        $statuses = [
            'Pending',
            'Completed',
            'Partial',
            'Failed',
            'Reversed',
        ];

        foreach ($statuses as $status) {
            PaymentStatus::firstOrCreate(['payment_status' => $status]);
        }
    }
}
