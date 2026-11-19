<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Populate any existing records where delivery_date is null using add_date or current timestamp
        DB::table('print_jobs')
            ->whereNull('delivery_date')
            ->whereNotNull('add_date')
            ->update([
                'delivery_date' => DB::raw('add_date'),
            ]);

        DB::table('print_jobs')
            ->whereNull('delivery_date')
            ->update([
                'delivery_date' => now(),
            ]);

        Schema::table('print_jobs', function (Blueprint $table) {
            $table->dateTime('delivery_date')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_jobs', function (Blueprint $table) {
            $table->dateTime('delivery_date')->nullable()->change();
        });
    }
};
