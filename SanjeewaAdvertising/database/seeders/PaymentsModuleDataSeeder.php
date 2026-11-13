<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Modules\PrintJob\Models\PrintJob;

class PaymentsModuleDataSeeder extends Seeder
{
    /**
     * Run the database seeds for real payment hub database records.
     */
    public function run(): void
    {
        // 1. Seed Suppliers if empty
        if (DB::table('suppliers')->count() === 0) {
            DB::table('suppliers')->insert([
                [
                    'id' => 1,
                    'name' => 'PaperPro Lanka (Pvt) Ltd',
                    'mobile' => '0772233445',
                    'email' => 'sales@paperpro.lk',
                ],
                [
                    'id' => 2,
                    'name' => 'Lanka Vinyl & Sign Supplies',
                    'mobile' => '0713344556',
                    'email' => 'info@lankavinyl.lk',
                ],
                [
                    'id' => 3,
                    'name' => 'ColorTech Eco-Solvent Inks',
                    'mobile' => '0764455667',
                    'email' => 'orders@colortech.lk',
                ],
            ]);
        }

        // 2. Seed Invoices for Print Jobs in database if empty
        if (DB::table('invoice')->count() === 0) {
            $printJobs = PrintJob::orderBy('id')->get();

            foreach ($printJobs as $job) {
                $addDate = $job->add_date ? Carbon::parse($job->add_date) : now();
                $dueDate = $addDate->copy()->addDays(14);

                $invoiceId = DB::table('invoice')->insertGetId([
                    'customer_id' => $job->customer_id,
                    'invoice_at' => $addDate,
                    'due_date' => $dueDate,
                ]);

                DB::table('invoice_print_jobs')->insert([
                    'invoice_id' => $invoiceId,
                    'print_jobs_id' => $job->id,
                ]);
            }
        }

        // Ensure GRN 101 and 102 exist for foreign keys
        if (! DB::table('grn')->where('id', 101)->exists()) {
            DB::table('grn')->insert(['id' => 101, 'at_time' => now()]);
        }
        if (! DB::table('grn')->where('id', 102)->exists()) {
            DB::table('grn')->insert(['id' => 102, 'at_time' => now()]);
        }

        // Ensure default payment types exist
        if (DB::table('payment_types')->count() === 0) {
            DB::table('payment_types')->insert([
                ['id' => 1, 'payment_type' => 'Cash'],
                ['id' => 2, 'payment_type' => 'Card'],
                ['id' => 3, 'payment_type' => 'Cheque'],
                ['id' => 4, 'payment_type' => 'Bank Transfer'],
            ]);
        }

        // Ensure default payment statuses exist
        if (DB::table('payment_statuses')->count() === 0) {
            DB::table('payment_statuses')->insert([
                ['id' => 1, 'payment_status' => 'Pending'],
                ['id' => 2, 'payment_status' => 'Paid'],
                ['id' => 3, 'payment_status' => 'Partial'],
                ['id' => 4, 'payment_status' => 'Cancelled'],
            ]);
        }

        // 3. Seed GRN Payments for real GRNs 101 and 102 if empty
        if (DB::table('grn_payments')->count() === 0) {
            DB::table('grn_payments')->insert([
                [
                    'id' => 1,
                    'grn_id' => 101,
                    'payment' => 346140.00,
                    'payment_types_id' => 4, // Bank Transfer
                    'pay_date' => '2026-10-18 11:30:00',
                    'payment_statuses_id' => 2, // Paid
                ],
                [
                    'id' => 2,
                    'grn_id' => 102,
                    'payment' => 150000.00,
                    'payment_types_id' => 3, // Check
                    'pay_date' => '2026-10-27 15:00:00',
                    'payment_statuses_id' => 4, // Partial
                ],
            ]);
        }

        // 4. Seed Operating Expenses if empty
        if (DB::table('expencesess')->count() === 0) {
            if (DB::table('expencesess_types')->count() === 0) {
                DB::table('expencesess_types')->insert([
                    ['id' => 1, 'expencesess_type' => 'Electricity Utility'],
                    ['id' => 2, 'expencesess_type' => 'Water Utility'],
                    ['id' => 3, 'expencesess_type' => 'Internet & Telephone'],
                    ['id' => 4, 'expencesess_type' => 'Shop Rent / Lease'],
                    ['id' => 5, 'expencesess_type' => 'Machine Maintenance & Parts'],
                ]);
            }

            if (DB::table('expencesess_statuses')->count() === 0) {
                DB::table('expencesess_statuses')->insert([
                    ['id' => 1, 'expencesess_status' => 'Pending'],
                    ['id' => 2, 'expencesess_status' => 'In Progress'],
                    ['id' => 3, 'expencesess_status' => 'Paid'],
                ]);
            }

            $adminUser = DB::table('users')->first();
            if (! $adminUser) {
                $statusId = DB::table('user_statuses')->value('id');
                if (! $statusId) {
                    $statusId = DB::table('user_statuses')->insertGetId(['id' => 1, 'user_status' => 'Active']);
                }
                $adminId = DB::table('users')->insertGetId([
                    'first_name' => 'Admin',
                    'last_name' => 'User',
                    'mobile' => '0771234567',
                    'register_at' => now(),
                    'username' => 'admin_test',
                    'password' => 'secret',
                    'is_login' => 0,
                    'user_statuses_id' => $statusId,
                ]);
            } else {
                $adminId = $adminUser->id;
            }

            DB::table('expencesess')->insert([
                [
                    'id' => 1,
                    'expencesess_types_id' => 1, // Electricity Utility
                    'price' => 48500.00,
                    'expencesess_statuses_id' => 3, // Paid
                    'add_by' => $adminId,
                    'pay_by' => $adminId,
                    'add_date' => '2026-10-05 09:00:00',
                    'pay_at' => '2026-10-20 11:00:00',
                ],
                [
                    'id' => 2,
                    'expencesess_types_id' => 2, // Water Utility
                    'price' => 6200.00,
                    'expencesess_statuses_id' => 3, // Paid
                    'add_by' => $adminId,
                    'pay_by' => $adminId,
                    'add_date' => '2026-10-06 09:30:00',
                    'pay_at' => '2026-10-18 10:15:00',
                ],
                [
                    'id' => 3,
                    'expencesess_types_id' => 3, // Internet & Telephone
                    'price' => 12500.00,
                    'expencesess_statuses_id' => 1, // Pending
                    'add_by' => $adminId,
                    'pay_by' => null,
                    'add_date' => '2026-10-08 10:00:00',
                    'pay_at' => null,
                ],
                [
                    'id' => 4,
                    'expencesess_types_id' => 4, // Shop Rent / Lease
                    'price' => 85000.00,
                    'expencesess_statuses_id' => 3, // Paid
                    'add_by' => $adminId,
                    'pay_by' => $adminId,
                    'add_date' => '2026-10-01 08:00:00',
                    'pay_at' => '2026-10-05 14:00:00',
                ],
                [
                    'id' => 5,
                    'expencesess_types_id' => 5, // Machine Maintenance & Parts
                    'price' => 15800.00,
                    'expencesess_statuses_id' => 1, // Pending
                    'add_by' => $adminId,
                    'pay_by' => null,
                    'add_date' => '2026-10-15 15:00:00',
                    'pay_at' => null,
                ],
            ]);
        }

        // 5. Seed Purchase Orders and link to GRNs if empty
        if (DB::table('purchase_orders')->count() === 0) {
            DB::table('purchase_orders')->insert([
                ['id' => 1, 'add_date' => '2026-10-08 09:00:00', 'suppliers_id' => 1],
                ['id' => 2, 'add_date' => '2026-10-20 10:00:00', 'suppliers_id' => 2],
                ['id' => 3, 'add_date' => '2026-10-22 11:30:00', 'suppliers_id' => 3],
            ]);
            DB::table('grn_has_puches_order')->insert([
                ['grn_id' => 101, 'purchase_orders_id' => 1, 'supplyer_invoice' => 'INV-PP-8821'],
                ['grn_id' => 102, 'purchase_orders_id' => 2, 'supplyer_invoice' => 'INV-LV-9412'],
            ]);
        }

        if (DB::table('purchase_order_items')->count() === 0 && DB::table('stock_items')->whereIn('id', [1, 2, 4, 7, 9])->count() === 5) {
            DB::table('purchase_order_items')->insert([
                ['purchase_orders_id' => 1, 'stock_items_id' => 1, 'unit_cost' => 1250.00, 'qty_ordered' => 50, 'qty_received' => 50],
                ['purchase_orders_id' => 1, 'stock_items_id' => 2, 'unit_cost' => 850.00, 'qty_ordered' => 30, 'qty_received' => 30],
                ['purchase_orders_id' => 2, 'stock_items_id' => 4, 'unit_cost' => 3200.00, 'qty_ordered' => 20, 'qty_received' => 20],
                ['purchase_orders_id' => 2, 'stock_items_id' => 7, 'unit_cost' => 4500.00, 'qty_ordered' => 15, 'qty_received' => 15],
                ['purchase_orders_id' => 3, 'stock_items_id' => 9, 'unit_cost' => 2800.00, 'qty_ordered' => 40, 'qty_received' => 0],
            ]);
        }
    }
}
