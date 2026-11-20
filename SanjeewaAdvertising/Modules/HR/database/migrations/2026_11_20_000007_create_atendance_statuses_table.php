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
        Schema::create('atendance_statuses', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('atendance_statuses', 30)->unique('atendance_statuses_UNIQUE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('atendance_statuses');
    }
};
