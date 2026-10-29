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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('stock_id');
            $table->unsignedTinyInteger('stock_movements_types_id');
            $table->unsignedInteger('qty');
            $table->dateTime('date');
            $table->unsignedBigInteger('source_id');

            $table->index('stock_id', 'fk_stock_movements_stock1_idx');
            $table->index('stock_movements_types_id', 'fk_stock_movements_stock_movements_types1_idx');

            $table->foreign('stock_id', 'fk_stock_movements_stock1')
                ->references('id')
                ->on('stock')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('stock_movements_types_id', 'fk_stock_movements_stock_movements_types1')
                ->references('id')
                ->on('stock_movements_types')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
