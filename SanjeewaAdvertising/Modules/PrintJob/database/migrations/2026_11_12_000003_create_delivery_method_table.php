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
        if (! Schema::hasTable('delivery_method')) {
            Schema::create('delivery_method', function (Blueprint $table) {
                $table->unsignedTinyInteger('id', true);
                $table->string('methord', 45)->unique('methord_UNIQUE');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_method');
    }
};
