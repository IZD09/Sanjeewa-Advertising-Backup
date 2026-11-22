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
        Schema::create('stock_units', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('unit', 45)->unique('unit_UNIQUE');
            $table->string('symble', 5)->unique('symble_UNIQUE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_units');
    }
};
