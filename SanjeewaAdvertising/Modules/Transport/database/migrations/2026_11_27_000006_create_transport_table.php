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
        if (Schema::hasTable('transport')) {
            return;
        }

        Schema::create('transport', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->dateTime('start');
            $table->dateTime('end')->nullable();
            $table->unsignedInteger('start_km');
            $table->unsignedInteger('end_km')->nullable();
            $table->unsignedInteger('desial_price_id');
            $table->unsignedInteger('truck_id');
            $table->unsignedBigInteger('staff_id');
            $table->unsignedInteger('junry');

            $table->index('desial_price_id', 'fk_transport_desial_price1_idx');
            $table->index('truck_id', 'fk_transport_truck1_idx');
            $table->index('staff_id', 'fk_transport_staff1_idx');

            $table->foreign('desial_price_id', 'fk_transport_desial_price1')
                ->references('id')
                ->on('desial_price')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('truck_id', 'fk_transport_truck1')
                ->references('id')
                ->on('truck')
                ->onDelete('no action')
                ->onUpdate('no action');

            $table->foreign('staff_id', 'fk_transport_staff1')
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
        Schema::dropIfExists('transport');
    }
};
