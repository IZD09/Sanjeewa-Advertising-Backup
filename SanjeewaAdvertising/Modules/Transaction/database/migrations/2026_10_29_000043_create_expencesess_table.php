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
        Schema::create('expencesess', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('expencesess_types_id');
            $table->decimal('price', 12, 2);
            $table->unsignedTinyInteger('expencesess_statuses_id');
            $table->unsignedInteger('add_by');
            $table->unsignedInteger('pay_by')->nullable();
            $table->dateTime('add_date');
            $table->dateTime('pay_at')->nullable();

            $table->index('expencesess_types_id', 'fk_expencesess_expencesess_types1_idx');
            $table->index('expencesess_statuses_id', 'fk_expencesess_expencesess_statuses1_idx');
            $table->index('add_by', 'fk_expencesess_users1_idx');
            $table->index('pay_by', 'fk_expencesess_users2_idx');

            $table->foreign('expencesess_types_id', 'fk_expencesess_expencesess_types1')
                ->references('id')
                ->on('expencesess_types')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('expencesess_statuses_id', 'fk_expencesess_expencesess_statuses1')
                ->references('id')
                ->on('expencesess_statuses')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('add_by', 'fk_expencesess_users1')
                ->references('id')
                ->on('users')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('pay_by', 'fk_expencesess_users2')
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
        Schema::dropIfExists('expencesess');
    }
};
