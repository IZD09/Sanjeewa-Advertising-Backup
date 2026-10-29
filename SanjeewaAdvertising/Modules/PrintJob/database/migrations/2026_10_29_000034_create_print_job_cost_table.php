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
        Schema::create('print_job_cost', function (Blueprint $table) {
            $table->unsignedBigInteger('print_jobs_id')->primary();
            $table->decimal('discount', 12, 2)->unsigned();

            $table->foreign('print_jobs_id', 'fk_print_job_cost_print_jobs1')
                ->references('id')
                ->on('print_jobs')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('print_job_cost');
    }
};
