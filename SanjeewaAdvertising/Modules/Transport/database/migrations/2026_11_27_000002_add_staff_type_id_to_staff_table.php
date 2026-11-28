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
        if (! Schema::hasTable('staff') || Schema::hasColumn('staff', 'staff_type_id')) {
            return;
        }

        // If staff rows already exist in the database, ensure a default staff_type (id=1) exists before adding FK
        if (DB::table('staff')->exists() && ! DB::table('staff_type')->exists()) {
            DB::table('staff_type')->insert([
                'id' => 1,
                'staff_type' => 'General Staff',
            ]);
        }

        $defaultTypeId = (int) (DB::table('staff_type')->orderBy('id')->value('id') ?: 1);

        Schema::table('staff', function (Blueprint $table) use ($defaultTypeId) {
            $table->unsignedTinyInteger('staff_type_id')->default($defaultTypeId);
            $table->index('staff_type_id', 'fk_staff_staff_type1_idx');
            $table->foreign('staff_type_id', 'fk_staff_staff_type1')
                ->references('id')
                ->on('staff_type')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('staff') || ! Schema::hasColumn('staff', 'staff_type_id')) {
            return;
        }

        Schema::table('staff', function (Blueprint $table) {
            $table->dropForeign('fk_staff_staff_type1');
            $table->dropIndex('fk_staff_staff_type1_idx');
            $table->dropColumn('staff_type_id');
        });
    }
};
