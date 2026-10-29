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
        Schema::create('activities', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->dateTime('activity_time');
            $table->unsignedTinyInteger('user_or_admin');
            $table->json('activity');
            $table->unsignedInteger('activity_types_id');

            $table->index('activity_types_id', 'fk_activities_activity_types1_idx');

            $table->foreign('activity_types_id', 'fk_activities_activity_types1')
                ->references('id')
                ->on('activity_types')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
