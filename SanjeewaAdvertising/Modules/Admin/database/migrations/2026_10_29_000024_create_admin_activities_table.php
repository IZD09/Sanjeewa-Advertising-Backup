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
        Schema::create('admin_activities', function (Blueprint $table) {
            $table->unsignedBigInteger('activities_id');
            $table->unsignedInteger('admins_id');

            $table->primary('activities_id');

            $table->index('admins_id', 'fk_admin_activities_admins1_idx');

            $table->foreign('activities_id', 'fk_admin_activities_activities1')
                ->references('id')
                ->on('activities')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('admins_id', 'fk_admin_activities_admins1')
                ->references('id')
                ->on('admins')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_activities');
    }
};
