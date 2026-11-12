<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Customer\Models\Customer;
use Modules\Design\Models\PrintType;
use Modules\PrintJob\Models\PrintJob;
use Modules\PrintJob\Models\PrintJobCost;
use Modules\PrintJob\Models\PrintJobStatusHistory;
use Modules\Transaction\Models\Payment;
use Modules\User\Models\User;

class PrintJobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();
        if ($customers->isEmpty()) {
            return;
        }

        $printTypes = PrintType::all();
        if ($printTypes->isEmpty()) {
            return;
        }

        $user = User::first() ?? User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'mobile' => '0770000000',
            'username' => 'admin_user_'.uniqid(),
            'password' => bcrypt('password'),
            'register_at' => now(),
            'is_login' => 0,
            'user_statuses_id' => 1,
        ]);

        $statuses = [1, 2, 3, 4, 5, 6, 7]; // Pending, Designing, Approved, Printing, Finishing, Ready, Completed

        for ($i = 1; $i <= 25; $i++) {
            $customer = $customers->random();
            $printType = $printTypes->random();
            $qty = rand(1, 10);
            $daysAgo = rand(0, 30);
            $addDate = now()->subDays($daysAgo);

            $wtdth = rand(2, 12);
            $hight = rand(2, 8);

            $job = PrintJob::create([
                'users_id' => $user->id,
                'customer_id' => $customer->id,
                'print_types_id' => $printType->id,
                'add_date' => $addDate,
                'qty' => $qty,
                'wtdth' => $wtdth,
                'hight' => $hight,
                'unit_id' => 1,
                'delivery_method_id' => rand(1, 2),
            ]);

            $statusId = $statuses[array_rand($statuses)];
            PrintJobStatusHistory::create([
                'print_jobs_id' => $job->id,
                'print_job_statuses_id' => $statusId,
                'update_at' => $addDate,
            ]);

            // Cost
            $unitPrice = rand(100, 500);
            $subtotal = $unitPrice * $qty;
            $discount = rand(0, 1) === 1 ? rand(50, 200) : 0;

            PrintJobCost::create([
                'print_jobs_id' => $job->id,
                'discount' => $discount,
            ]);

            // Optional payment
            $totalAmount = max(0, $subtotal - $discount);
            if ($i % 3 === 0) {
                // Fully paid
                Payment::create([
                    'payment' => $totalAmount,
                    'print_jobs_id' => $job->id,
                    'payment_types_id' => 1, // Cash
                    'pay_date' => $addDate,
                    'payment_statuses_id' => 2, // Completed
                ]);
            } elseif ($i % 2 === 0) {
                // Partially paid
                Payment::create([
                    'payment' => round($totalAmount / 2, 2),
                    'print_jobs_id' => $job->id,
                    'payment_types_id' => 2, // Bank Transfer
                    'pay_date' => $addDate,
                    'payment_statuses_id' => 2,
                ]);
            }
        }
    }
}
