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
        Schema::create('print_cost', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('print_cost_type_id');
            $table->decimal('price', 12, 2)->unsigned();
            $table->dateTime('add_at');

            $table->index('print_cost_type_id', 'fk_print_cost_print_cost_type1_idx');

            $table->foreign('print_cost_type_id', 'fk_print_cost_print_cost_type1')
                ->references('id')
                ->on('print_cost_type')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_cost');
    }
};
