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
        Schema::table('print_jobs', function (Blueprint $table) {
            if (! Schema::hasColumn('print_jobs', 'discription')) {
                $table->string('discription', 255)->nullable()->after('delivery_method_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_jobs', function (Blueprint $table) {
            if (Schema::hasColumn('print_jobs', 'discription')) {
                $table->dropColumn('discription');
            }
        });
    }
};
