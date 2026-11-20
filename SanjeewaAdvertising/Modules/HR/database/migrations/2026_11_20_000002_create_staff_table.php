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
        Schema::create('staff', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('mobile', 15);
            $table->string('nic', 15)->unique('nic_UNIQUE');
            $table->unsignedTinyInteger('staff_statuses_id');
            $table->dateTime('add_at');
            $table->unsignedInteger('add_by');

            $table->index('staff_statuses_id', 'fk_staff_staff_statuses1_idx');
            $table->index('add_by', 'fk_staff_admins1_idx');

            $table->foreign('staff_statuses_id', 'fk_staff_staff_statuses1')
                ->references('id')
                ->on('staff_statuses')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('add_by', 'fk_staff_admins1')
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
        Schema::dropIfExists('staff');
    }
};
