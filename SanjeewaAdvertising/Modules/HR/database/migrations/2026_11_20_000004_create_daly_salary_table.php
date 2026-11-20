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
        Schema::create('daly_salary', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->dateTime('pay_at');
            $table->decimal('amount', 12, 2)->unsigned();
            $table->unsignedBigInteger('staff_id');

            $table->index('staff_id', 'fk_daly_salary_staff1_idx');

            $table->foreign('staff_id', 'fk_daly_salary_staff1')
                ->references('id')
                ->on('staff')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daly_salary');
    }
};
