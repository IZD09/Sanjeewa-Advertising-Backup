<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoice_print_jobs', function (Blueprint $table) {
            $table->unsignedBigInteger('print_jobs_id');
            $table->unsignedBigInteger('invoice_id');

            $table->primary(['print_jobs_id', 'invoice_id']);

            $table->index('invoice_id', 'fk_print_jobs_has_invoice_invoice1_idx');
            $table->index('print_jobs_id', 'fk_print_jobs_has_invoice_print_jobs1_idx');

            $table->foreign('print_jobs_id', 'fk_print_jobs_has_invoice_print_jobs1')
                ->references('id')
                ->on('print_jobs')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('invoice_id', 'fk_print_jobs_has_invoice_invoice1')
                ->references('id')
                ->on('invoice')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_print_jobs');
    }
};
