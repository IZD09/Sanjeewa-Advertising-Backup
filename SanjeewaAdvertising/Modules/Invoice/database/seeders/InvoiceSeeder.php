<?php

namespace Modules\Invoice\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Modules\Invoice\Models\Invoice;
use Modules\Invoice\Models\InvoicePrintJob;
use Modules\PrintJob\Models\PrintJob;

class InvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Invoice::count() > 0) {
            return;
        }

        $printJobs = PrintJob::orderBy('id')->get();

        foreach ($printJobs as $job) {
            $addDate = $job->add_date ? Carbon::parse($job->add_date) : now();

            $invoice = Invoice::create([
                'customer_id' => $job->customer_id,
                'invoice_at' => $addDate,
                'due_date' => $addDate->copy()->addDays(14),
            ]);

            InvoicePrintJob::firstOrCreate([
                'invoice_id' => $invoice->id,
                'print_jobs_id' => $job->id,
            ]);
        }
    }
}
