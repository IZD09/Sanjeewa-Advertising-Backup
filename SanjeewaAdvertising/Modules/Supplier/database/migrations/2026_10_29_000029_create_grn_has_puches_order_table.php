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
        Schema::create('grn_has_puches_order', function (Blueprint $table) {
            $table->unsignedBigInteger('grn_id');
            $table->unsignedBigInteger('purchase_orders_id');
            $table->string('supplyer_invoice', 45)->nullable()->unique('supplyer_invoice_UNIQUE');

            $table->primary(['grn_id', 'purchase_orders_id']);

            $table->index('grn_id', 'fk_grn_has_puches_order_grn1_idx');
            $table->index('purchase_orders_id', 'fk_grn_has_puches_order_purchase_orders1_idx');

            $table->foreign('grn_id', 'fk_grn_has_puches_order_grn1')
                ->references('id')
                ->on('grn')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('purchase_orders_id', 'fk_grn_has_puches_order_purchase_orders1')
                ->references('id')
                ->on('purchase_orders')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grn_has_puches_order');
    }
};
