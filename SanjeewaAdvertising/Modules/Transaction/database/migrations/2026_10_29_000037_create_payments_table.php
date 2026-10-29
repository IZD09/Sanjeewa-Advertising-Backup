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
        Schema::create('payments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->decimal('payment', 12, 2)->unsigned();
            $table->unsignedBigInteger('print_jobs_id');
            $table->unsignedTinyInteger('payment_types_id');
            $table->dateTime('pay_date');
            $table->unsignedTinyInteger('payment_statuses_id');

            $table->index('print_jobs_id', 'fk_payments_print_jobs1_idx');
            $table->index('payment_types_id', 'fk_payments_payment_types1_idx');
            $table->index('payment_statuses_id', 'fk_payments_payment_statuses1_idx');

            $table->foreign('print_jobs_id', 'fk_payments_print_jobs1')
                ->references('id')
                ->on('print_jobs')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('payment_types_id', 'fk_payments_payment_types1')
                ->references('id')
                ->on('payment_types')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('payment_statuses_id', 'fk_payments_payment_statuses1')
                ->references('id')
                ->on('payment_statuses')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
