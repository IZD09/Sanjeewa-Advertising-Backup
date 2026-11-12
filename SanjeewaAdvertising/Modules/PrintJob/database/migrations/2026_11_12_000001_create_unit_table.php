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
        if (! Schema::hasTable('unit')) {
            Schema::create('unit', function (Blueprint $table) {
                $table->unsignedTinyInteger('id', true);
                $table->string('simble', 5)->unique('simble_UNIQUE');
                $table->string('name', 45)->unique('name_UNIQUE');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit');
    }
};
