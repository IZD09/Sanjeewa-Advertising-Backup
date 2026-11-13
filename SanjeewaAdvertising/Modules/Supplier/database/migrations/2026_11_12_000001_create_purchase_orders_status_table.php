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
        if (! Schema::hasTable('purchase_orders_status')) {
            Schema::create('purchase_orders_status', function (Blueprint $table) {
                $table->tinyIncrements('id');
                $table->string('purchase_orders_status', 45)->unique('purchase_orders_status_UNIQUE');
            });
        }

        // Seed default statuses immediately so FK constraint succeeds
        $statuses = [
            1 => 'Pending',
            2 => 'Partial',
            3 => 'Completed',
            4 => 'Cancelled',
        ];

        foreach ($statuses as $id => $name) {
            DB::table('purchase_orders_status')->updateOrInsert(
                ['id' => $id],
                ['purchase_orders_status' => $name]
            );
        }

        if (Schema::hasTable('purchase_orders') && ! Schema::hasColumn('purchase_orders', 'purchase_orders_status_id')) {
            Schema::table('purchase_orders', function (Blueprint $table) {
                $table->unsignedTinyInteger('purchase_orders_status_id')
                    ->default(1)
                    ->after('suppliers_id');

                $table->index('purchase_orders_status_id', 'fk_purchase_orders_purchase_orders_status1_idx');

                $table->foreign('purchase_orders_status_id', 'fk_purchase_orders_purchase_orders_status1')
                    ->references('id')
                    ->on('purchase_orders_status')
                    ->onDelete('no action')
                    ->onUpdate('no action');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('purchase_orders') && Schema::hasColumn('purchase_orders', 'purchase_orders_status_id')) {
            Schema::table('purchase_orders', function (Blueprint $table) {
                $table->dropForeign('fk_purchase_orders_purchase_orders_status1');
                $table->dropIndex('fk_purchase_orders_purchase_orders_status1_idx');
                $table->dropColumn('purchase_orders_status_id');
            });
        }

        Schema::dropIfExists('purchase_orders_status');
    }
};
