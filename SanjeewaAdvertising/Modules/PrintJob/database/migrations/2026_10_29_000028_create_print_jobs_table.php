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
        Schema::create('print_jobs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('users_id');
            $table->unsignedInteger('customer_id');
            $table->unsignedTinyInteger('print_types_id');
            $table->dateTime('add_date');
            $table->integer('qty');

            $table->index('customer_id', 'fk_print_jobs_customer1_idx');
            $table->index('print_types_id', 'fk_print_jobs_print_types1_idx');
            $table->index('users_id', 'fk_print_jobs_users1_idx');

            $table->foreign('customer_id', 'fk_print_jobs_customer1')
                ->references('id')
                ->on('customer')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('print_types_id', 'fk_print_jobs_print_types1')
                ->references('id')
                ->on('print_types')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('users_id', 'fk_print_jobs_users1')
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
        Schema::dropIfExists('print_jobs');
    }
};
