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
        Schema::create('print_job_has_cost', function (Blueprint $table) {
            $table->unsignedBigInteger('print_job_cost_print_jobs_id');
            $table->unsignedInteger('print_cost_id');

            $table->primary(['print_job_cost_print_jobs_id', 'print_cost_id']);

            $table->index('print_cost_id', 'fk_print_job_cost_has_print_cost_print_cost1_idx');
            $table->index('print_job_cost_print_jobs_id', 'fk_print_job_cost_has_print_cost_print_job_cost1_idx');

            $table->foreign('print_job_cost_print_jobs_id', 'fk_print_job_cost_has_print_cost_print_job_cost1')
                ->references('print_jobs_id')
                ->on('print_job_cost')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('print_cost_id', 'fk_print_job_cost_has_print_cost_print_cost1')
                ->references('id')
                ->on('print_cost')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_job_has_cost');
    }
};
