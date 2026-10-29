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
        Schema::create('stock_items', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 50);
            $table->unsignedInteger('subcategories_id');
            $table->string('code', 50)->unique('code_UNIQUE');

            $table->index('subcategories_id', 'fk_stock_items_subcategories1_idx');

            $table->foreign('subcategories_id', 'fk_stock_items_subcategories1')
                ->references('id')
                ->on('subcategories')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_items');
    }
};
