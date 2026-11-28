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
        if (Schema::hasTable('model')) {
            return;
        }

        Schema::create('model', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('mane', 45)->unique('mane_UNIQUE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('model');
    }
};
