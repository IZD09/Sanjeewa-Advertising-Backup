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
        Schema::create('system_modules_has_users', function (Blueprint $table) {
            $table->unsignedTinyInteger('system_modules_id');
            $table->unsignedInteger('users_id');
            $table->unsignedTinyInteger('view')->default(0);
            $table->unsignedTinyInteger('create')->default(0);
            $table->unsignedTinyInteger('edit')->default(0);
            $table->unsignedTinyInteger('delete')->default(0);
            $table->unsignedTinyInteger('export')->default(0);

            $table->primary(['system_modules_id', 'users_id']);

            $table->index('users_id', 'fk_system_modules_has_users_users1_idx');
            $table->index('system_modules_id', 'fk_system_modules_has_users_system_modules1_idx');

            $table->foreign('system_modules_id', 'fk_system_modules_has_users_system_modules1')
                ->references('id')
                ->on('system_modules')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('users_id', 'fk_system_modules_has_users_users1')
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
        Schema::dropIfExists('system_modules_has_users');
    }
};
