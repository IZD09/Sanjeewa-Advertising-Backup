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
        // Ensure default unit exists before adding foreign key constraint
        if (Schema::hasTable('unit') && DB::table('unit')->count() === 0) {
            DB::table('unit')->insert([
                ['id' => 1, 'simble' => 'ft', 'name' => 'Feet'],
                ['id' => 2, 'simble' => 'in', 'name' => 'Inches'],
                ['id' => 3, 'simble' => 'cm', 'name' => 'Centimeters'],
                ['id' => 4, 'simble' => 'mm', 'name' => 'Millimeters'],
                ['id' => 5, 'simble' => 'm', 'name' => 'Meters'],
                ['id' => 6, 'simble' => 'pcs', 'name' => 'Pieces'],
            ]);
        }

        Schema::table('print_jobs', function (Blueprint $table) {
            if (! Schema::hasColumn('print_jobs', 'wtdth')) {
                $table->unsignedInteger('wtdth')->default(0)->after('qty');
            }
            if (! Schema::hasColumn('print_jobs', 'hight')) {
                $table->unsignedInteger('hight')->default(0)->after('wtdth');
            }
            if (! Schema::hasColumn('print_jobs', 'unit_id')) {
                $table->unsignedTinyInteger('unit_id')->default(1)->after('hight');
                $table->index('unit_id', 'fk_print_jobs_unit1_idx');
                $table->foreign('unit_id', 'fk_print_jobs_unit1')
                    ->references('id')
                    ->on('unit')
                    ->onDelete('no action')
                    ->onUpdate('no action');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('print_jobs', function (Blueprint $table) {
            if (Schema::hasColumn('print_jobs', 'unit_id')) {
                // Drop foreign key and index if supported
                try {
                    $table->dropForeign('fk_print_jobs_unit1');
                    $table->dropIndex('fk_print_jobs_unit1_idx');
                } catch (Throwable) {
                    // Ignore on sqlite in tests if not applicable
                }
                $table->dropColumn('unit_id');
            }
            if (Schema::hasColumn('print_jobs', 'hight')) {
                $table->dropColumn('hight');
            }
            if (Schema::hasColumn('print_jobs', 'wtdth')) {
                $table->dropColumn('wtdth');
            }
        });
    }
};
