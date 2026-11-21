<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('grn_statuses')->updateOrInsert(
            ['id' => 6],
            ['grn_status' => 'Pending Stock']
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('grn_statuses')->where('id', 6)->delete();
    }
};
