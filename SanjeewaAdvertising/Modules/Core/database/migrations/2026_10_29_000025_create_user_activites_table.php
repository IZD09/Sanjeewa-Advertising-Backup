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
        Schema::create('user_activites', function (Blueprint $table) {
            $table->unsignedBigInteger('activities_id');
            $table->unsignedInteger('users_id');

            $table->primary('activities_id');

            $table->index('users_id', 'fk_user_activites_users1_idx');

            $table->foreign('activities_id', 'fk_user_activites_activities1')
                ->references('id')
                ->on('activities')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('users_id', 'fk_user_activites_users1')
                ->references('id')
                ->on('users')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_activites');
    }
};
