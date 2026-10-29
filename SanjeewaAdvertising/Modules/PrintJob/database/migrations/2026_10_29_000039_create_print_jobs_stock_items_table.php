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
        Schema::create('print_jobs_stock_items', function (Blueprint $table) {
            $table->unsignedBigInteger('print_jobs_id');
            $table->unsignedBigInteger('stock_id');
            $table->unsignedInteger('qty');

            $table->primary(['print_jobs_id', 'stock_id']);

            $table->index('stock_id', 'fk_table1_stock1_idx');

            $table->foreign('print_jobs_id', 'fk_table1_print_jobs1')
                ->references('id')
                ->on('print_jobs')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('stock_id', 'fk_table1_stock1')
                ->references('id')
                ->on('stock')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_jobs_stock_items');
    }
};
