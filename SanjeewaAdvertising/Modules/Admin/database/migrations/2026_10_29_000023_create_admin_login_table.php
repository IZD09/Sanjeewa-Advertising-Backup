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
        Schema::create('admin_login', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('admins_id');
            $table->dateTime('login');
            $table->dateTime('logout')->nullable();

            $table->index('admins_id', 'fk_admin_login_admins1_idx');

            $table->foreign('admins_id', 'fk_admin_login_admins1')
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
        Schema::dropIfExists('admin_login');
    }
};
