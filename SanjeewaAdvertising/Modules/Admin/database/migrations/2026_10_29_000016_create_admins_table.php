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
        Schema::create('admins', function (Blueprint $table) {
            $table->increments('id');
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('username', 30)->unique('admins_username_unique');
            $table->string('password', 255);
            $table->string('mobile', 15)->unique('admins_mobile_unique');
            $table->string('email', 100)->unique('admins_email_unique');
            $table->dateTime('add_time');
            $table->unsignedTinyInteger('is_log')->default(0);
            $table->unsignedTinyInteger('admin_statuses_id');
            $table->unsignedTinyInteger('admin_types_id');

            $table->index('admin_statuses_id', 'fk_admins_admin_statuses1_idx');
            $table->index('admin_types_id', 'fk_admins_admin_types1_idx');

            $table->foreign('admin_statuses_id', 'fk_admins_admin_statuses1')
                ->references('id')
                ->on('admin_statuses')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('admin_types_id', 'fk_admins_admin_types1')
                ->references('id')
                ->on('admin_types')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
