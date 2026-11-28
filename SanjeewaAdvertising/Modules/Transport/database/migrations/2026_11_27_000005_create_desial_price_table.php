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
        if (Schema::hasTable('desial_price')) {
            return;
        }

        Schema::create('desial_price', function (Blueprint $table) {
            $table->increments('id');
            $table->decimal('price', 12, 2)->unsigned();
            $table->date('add_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('desial_price');
    }
};
