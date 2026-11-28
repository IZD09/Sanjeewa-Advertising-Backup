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
        if (Schema::hasTable('staff_type')) {
            return;
        }

        Schema::create('staff_type', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('staff_type', 45)->unique('staff_type_UNIQUE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_type');
    }
};
