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
        Schema::create('item_batches', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('stock_items_id');

            $table->index('stock_items_id', 'fk_item_batches_stock_items1_idx');

            $table->foreign('stock_items_id', 'fk_item_batches_stock_items1')
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
        Schema::dropIfExists('item_batches');
    }
};
