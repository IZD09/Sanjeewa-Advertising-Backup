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
        Schema::create('work_days', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->date('date');
            $table->unsignedTinyInteger('work_day_statuses_id');

            $table->index('work_day_statuses_id', 'fk_work_days_work_day_statuses1_idx');

            $table->foreign('work_day_statuses_id', 'fk_work_days_work_day_statuses1')
                ->references('id')
                ->on('work_day_statuses')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_days');
    }
};
