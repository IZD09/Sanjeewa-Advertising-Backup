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
        Schema::create('grn_payments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedTinyInteger('payment_types_id');
            $table->dateTime('pay_date');
            $table->unsignedBigInteger('grn_id');
            $table->unsignedTinyInteger('payment_statuses_id');
            $table->decimal('payment', 12, 2)->unsigned();

            $table->index('payment_types_id', 'fk_grn_payments_payment_types1_idx');
            $table->index('grn_id', 'fk_grn_payments_grn1_idx');
            $table->index('payment_statuses_id', 'fk_grn_payments_payment_statuses1_idx');

            $table->foreign('payment_types_id', 'fk_grn_payments_payment_types1')
                ->references('id')
                ->on('payment_types')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('grn_id', 'fk_grn_payments_grn1')
                ->references('id')
                ->on('grn')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('payment_statuses_id', 'fk_grn_payments_payment_statuses1')
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
        Schema::dropIfExists('grn_payments');
    }
};
