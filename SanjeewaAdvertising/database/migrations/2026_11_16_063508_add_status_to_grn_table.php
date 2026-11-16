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
        Schema::table('grn', function (Blueprint $table) {
            $table->string('status', 30)->default('Draft')->after('at_time');
        });

        $completedGrnIds = DB::table('stock')
            ->whereNotNull('grn_id')
            ->distinct()
            ->pluck('grn_id');

        if ($completedGrnIds->isNotEmpty()) {
            DB::table('grn')
                ->whereIn('id', $completedGrnIds)
                ->update(['status' => 'Completed']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('grn', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
