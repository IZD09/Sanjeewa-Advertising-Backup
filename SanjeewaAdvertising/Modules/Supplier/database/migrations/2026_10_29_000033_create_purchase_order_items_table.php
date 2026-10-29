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
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->unsignedBigInteger('purchase_orders_id');
            $table->unsignedInteger('stock_items_id');
            $table->decimal('unit_cost', 12, 2)->unsigned();
            $table->unsignedInteger('qty_ordered');
            $table->unsignedInteger('qty_received');

            $table->primary(['purchase_orders_id', 'stock_items_id']);

            $table->index('stock_items_id', 'fk_puches_order_items_stock_items1_idx');
            $table->index('purchase_orders_id', 'fk_puches_order_items_purchase_orders1_idx');

            $table->foreign('purchase_orders_id', 'fk_puches_order_items_purchase_orders1')
                ->references('id')
                ->on('purchase_orders')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('stock_items_id', 'fk_puches_order_items_stock_items1')
                ->references('id')
                ->on('stock_items')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
    }
};
