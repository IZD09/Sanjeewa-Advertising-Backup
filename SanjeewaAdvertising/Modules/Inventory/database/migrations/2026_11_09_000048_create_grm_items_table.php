<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('grm_items', function (Blueprint $table) {
            $table->unsignedBigInteger('grn_id');
            $table->unsignedBigInteger('item_batches_id');
            $table->unsignedBigInteger('stock_id');
            $table->unsignedInteger('qty');

            $table->primary(['grn_id', 'item_batches_id', 'stock_id']);

            $table->index('grn_id', 'fk_grm_items_grn1_idx');
            $table->index('item_batches_id', 'fk_grm_items_item_batches1_idx');
            $table->index('stock_id', 'fk_grm_items_stock1_idx');

            $table->foreign('grn_id', 'fk_grm_items_grn1')
                ->references('id')
                ->on('grn')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('item_batches_id', 'fk_grm_items_item_batches1')
                ->references('id')
                ->on('item_batches')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('stock_id', 'fk_grm_items_stock1')
                ->references('id')
                ->on('stock')
                ->onDelete('no action')
                ->onUpdate('no action');
        });

        try {
            DB::statement('CREATE OR REPLACE VIEW grn_items AS SELECT * FROM grm_items');
        } catch (Throwable) {
            // View creation optional depending on database privilege
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement('DROP VIEW IF EXISTS grn_items');
        } catch (Throwable) {
            // Drop view optional
        }

        Schema::dropIfExists('grm_items');
    }
};
