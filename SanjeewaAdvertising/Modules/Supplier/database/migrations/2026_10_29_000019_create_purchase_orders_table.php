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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->dateTime('add_date');
            $table->unsignedInteger('suppliers_id');

            $table->index('suppliers_id', 'fk_puches_order_suppliers1_idx');

            $table->foreign('suppliers_id', 'fk_puches_order_suppliers1')
                ->references('id')
                ->on('suppliers')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
