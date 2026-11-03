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
        Schema::create('expencesess_statuses', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('expencesess_status', 30)->unique('expencesess_status_UNIQUE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expencesess_statuses');
    }
};
