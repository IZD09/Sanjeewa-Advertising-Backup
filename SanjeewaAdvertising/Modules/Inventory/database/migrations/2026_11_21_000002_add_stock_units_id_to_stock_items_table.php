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
        // Ensure default stock units exist so foreign key defaults do not fail
        if (Schema::hasTable('stock_units') && DB::table('stock_units')->count() === 0) {
            DB::table('stock_units')->insert([
                ['id' => 1, 'unit' => 'Pieces', 'symble' => 'pcs'],
                ['id' => 2, 'unit' => 'Rolls', 'symble' => 'roll'],
                ['id' => 3, 'unit' => 'Boxes', 'symble' => 'box'],
                ['id' => 4, 'unit' => 'Packets', 'symble' => 'pack'],
                ['id' => 5, 'unit' => 'Meters', 'symble' => 'm'],
                ['id' => 6, 'unit' => 'Sheets', 'symble' => 'sht'],
                ['id' => 7, 'unit' => 'Liters', 'symble' => 'L'],
                ['id' => 8, 'unit' => 'Kilograms', 'symble' => 'kg'],
            ]);
        }

        if (! Schema::hasColumn('stock_items', 'stock_units_id')) {
            Schema::table('stock_items', function (Blueprint $table) {
                $table->unsignedTinyInteger('stock_units_id')->default(1)->after('reorder_qty');

                $table->index('stock_units_id', 'fk_stock_items_stock_units1_idx');
                $table->foreign('stock_units_id', 'fk_stock_items_stock_units1')
                    ->references('id')
                    ->on('stock_units')
                    ->onUpdate('NO ACTION')
                    ->onDelete('NO ACTION');
            });
        }

        // Populate realistic stock units for existing stock items based on code / category
        DB::table('stock_items')->where('code', 'like', 'INK-%')->update(['stock_units_id' => 7]); // Liters
        DB::table('stock_items')->where('code', 'like', 'FLX-%')->update(['stock_units_id' => 2]); // Rolls
        DB::table('stock_items')->where('code', 'like', 'VIN-%')->update(['stock_units_id' => 2]); // Rolls
        DB::table('stock_items')->where('code', 'like', 'LAM-%')->update(['stock_units_id' => 2]); // Rolls
        DB::table('stock_items')->where('code', 'like', 'RIG-%')->update(['stock_units_id' => 6]); // Sheets
        DB::table('stock_items')->where('code', 'like', 'PAP-%')->update(['stock_units_id' => 4]); // Packets
        DB::table('stock_items')->where('code', 'like', 'DSP-%')->update(['stock_units_id' => 1]); // Pieces
        DB::table('stock_items')->where('code', 'ACC-101')->update(['stock_units_id' => 3]); // Boxes (Eyelets)
        DB::table('stock_items')->whereIn('code', ['ACC-201', 'ACC-301'])->update(['stock_units_id' => 2]); // Rolls (Tape)
        DB::table('stock_items')->where('code', 'ACC-401')->update(['stock_units_id' => 1]); // Pieces (Corner Punch)
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('stock_items', 'stock_units_id')) {
            Schema::table('stock_items', function (Blueprint $table) {
                $table->dropForeign('fk_stock_items_stock_units1');
                $table->dropIndex('fk_stock_items_stock_units1_idx');
                $table->dropColumn('stock_units_id');
            });
        }
    }
};
