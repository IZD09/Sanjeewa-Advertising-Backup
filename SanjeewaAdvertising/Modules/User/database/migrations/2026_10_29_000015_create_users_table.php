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
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('mobile', 15)->unique('mobile_UNIQUE');
            $table->dateTime('register_at');
            $table->string('username', 30)->unique('username_UNIQUE');
            $table->string('password', 255);
            $table->unsignedTinyInteger('is_login');
            $table->unsignedTinyInteger('user_statuses_id');

            $table->index('user_statuses_id', 'fk_users_user_statuses1_idx');

            $table->foreign('user_statuses_id', 'fk_users_user_statuses1')
                ->references('id')
                ->on('user_statuses')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
