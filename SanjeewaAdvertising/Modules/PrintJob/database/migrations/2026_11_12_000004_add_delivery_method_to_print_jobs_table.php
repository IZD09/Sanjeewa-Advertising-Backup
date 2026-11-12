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
        // Ensure default delivery methods exist before adding foreign key constraint
        if (Schema::hasTable('delivery_method') && DB::table('delivery_method')->count() === 0) {
            DB::table('delivery_method')->insert([
                ['id' => 1, 'methord' => 'Customer Pickup'],
                ['id' => 2, 'methord' => 'Courier Delivery'],
                ['id' => 3, 'methord' => 'Company Delivery'],
                ['id' => 4, 'methord' => 'Express Delivery'],
                ['id' => 5, 'methord' => 'Postal Service'],
            ]);
        }

        Schema::table('print_jobs', function (Blueprint $table) {
            if (! Schema::hasColumn('print_jobs', 'delivery_method_id')) {
                $table->unsignedTinyInteger('delivery_method_id')->default(1)->after('unit_id');
                $table->index('delivery_method_id', 'fk_print_jobs_delivery_method1_idx');
                $table->foreign('delivery_method_id', 'fk_print_jobs_delivery_method1')
                    ->references('id')
                    ->on('delivery_method')
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
            if (Schema::hasColumn('print_jobs', 'delivery_method_id')) {
                try {
                    $table->dropForeign('fk_print_jobs_delivery_method1');
                    $table->dropIndex('fk_print_jobs_delivery_method1_idx');
                } catch (Throwable) {
                    // Ignore on sqlite if not supported
                }
                $table->dropColumn('delivery_method_id');
            }
        });
    }
};
