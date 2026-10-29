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
        Schema::create('stock_items_has_brands', function (Blueprint $table) {
            $table->unsignedInteger('stock_items_id');
            $table->unsignedInteger('brands_id');

            $table->primary(['stock_items_id', 'brands_id']);

            $table->index('brands_id', 'fk_stock_items_has_brands_brands1_idx');
            $table->index('stock_items_id', 'fk_stock_items_has_brands_stock_items1_idx');

            $table->foreign('stock_items_id', 'fk_stock_items_has_brands_stock_items1')
                ->references('id')
                ->on('stock_items')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('brands_id', 'fk_stock_items_has_brands_brands1')
                ->references('id')
                ->on('brands')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_items_has_brands');
    }
};
