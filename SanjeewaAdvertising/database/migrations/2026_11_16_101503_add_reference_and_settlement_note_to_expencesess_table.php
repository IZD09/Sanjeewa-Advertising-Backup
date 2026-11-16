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
        Schema::table('expencesess', function (Blueprint $table) {
            if (! Schema::hasColumn('expencesess', 'reference')) {
                $table->string('reference', 50)->nullable()->unique('reference_UNIQUE')->after('pay_at');
            }
            if (! Schema::hasColumn('expencesess', 'settlement_note')) {
                $table->string('settlement_note', 255)->nullable()->after('reference');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expencesess', function (Blueprint $table) {
            if (Schema::hasColumn('expencesess', 'reference')) {
                $table->dropUnique('reference_UNIQUE');
                $table->dropColumn('reference');
            }
            if (Schema::hasColumn('expencesess', 'settlement_note')) {
                $table->dropColumn('settlement_note');
            }
        });
    }
};
