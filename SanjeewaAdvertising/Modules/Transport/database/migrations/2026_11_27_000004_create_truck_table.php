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
        if (Schema::hasTable('truck')) {
            return;
        }

        Schema::create('truck', function (Blueprint $table) {
            $table->increments('id');
            $table->string('register', 10)->unique('register_UNIQUE');
            $table->unsignedTinyInteger('model_id');

            $table->index('model_id', 'fk_truck_model1_idx');
            $table->foreign('model_id', 'fk_truck_model1')
                ->references('id')
                ->on('model')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('truck');
    }
};
