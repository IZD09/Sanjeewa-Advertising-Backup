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
        Schema::create('stock', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('stock_items_id');
            $table->dateTime('add_date');
            $table->unsignedInteger('qty');
            $table->decimal('price', 12, 2)->unsigned();
            $table->decimal('buy', 12, 2);
            $table->unsignedBigInteger('grn_id');
            $table->unsignedInteger('brands_id');

            $table->index('stock_items_id', 'fk_stock_stock_items1_idx');
            $table->index('grn_id', 'fk_stock_grn1_idx');
            $table->index('brands_id', 'fk_stock_brands1_idx');

            $table->foreign('stock_items_id', 'fk_stock_stock_items1')
                ->references('id')
                ->on('stock_items')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('grn_id', 'fk_stock_grn1')
                ->references('id')
                ->on('grn')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('brands_id', 'fk_stock_brands1')
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
        Schema::dropIfExists('stock');
    }
};
