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
        Schema::create('atendance', function (Blueprint $table) {
            $table->unsignedBigInteger('work_days_id');
            $table->unsignedBigInteger('staff_id');
            $table->unsignedTinyInteger('atendance_statuses_id');
            $table->time('in')->nullable();
            $table->time('out')->nullable();

            $table->primary(['work_days_id', 'staff_id']);

            $table->index('work_days_id', 'fk_atendance_work_days1_idx');
            $table->index('staff_id', 'fk_atendance_staff1_idx');
            $table->index('atendance_statuses_id', 'fk_atendance_atendance_statuses1_idx');

            $table->foreign('work_days_id', 'fk_atendance_work_days1')
                ->references('id')
                ->on('work_days')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('staff_id', 'fk_atendance_staff1')
                ->references('id')
                ->on('staff')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('atendance_statuses_id', 'fk_atendance_atendance_statuses1')
                ->references('id')
                ->on('atendance_statuses')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('atendance');
    }
};
