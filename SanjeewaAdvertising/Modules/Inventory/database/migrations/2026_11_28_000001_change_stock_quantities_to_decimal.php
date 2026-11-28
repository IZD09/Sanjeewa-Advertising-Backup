<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to support fractional stock quantities up to 3 decimal places.
     */
    public function up(): void
    {
        if (Schema::hasTable('stock') && Schema::hasColumn('stock', 'qty')) {
            Schema::table('stock', function (Blueprint $table): void {
                $table->decimal('qty', 12, 3)->unsigned()->change();
            });
        }

        if (Schema::hasTable('grm_items') && Schema::hasColumn('grm_items', 'qty')) {
            Schema::table('grm_items', function (Blueprint $table): void {
                $table->decimal('qty', 12, 3)->unsigned()->change();
            });
        }

        if (Schema::hasTable('stock_movements') && Schema::hasColumn('stock_movements', 'qty')) {
            Schema::table('stock_movements', function (Blueprint $table): void {
                $table->decimal('qty', 12, 3)->unsigned()->change();
            });
        }

        if (Schema::hasTable('stock_items')) {
            Schema::table('stock_items', function (Blueprint $table): void {
                if (Schema::hasColumn('stock_items', 'low_stock_qty')) {
                    $table->decimal('low_stock_qty', 12, 3)->unsigned()->default(10)->change();
                }
                if (Schema::hasColumn('stock_items', 'reorder_qty')) {
                    $table->decimal('reorder_qty', 12, 3)->unsigned()->default(20)->change();
                }
            });
        }

        if (Schema::hasTable('print_jobs_stock_items') && Schema::hasColumn('print_jobs_stock_items', 'qty')) {
            Schema::table('print_jobs_stock_items', function (Blueprint $table): void {
                $table->decimal('qty', 12, 3)->unsigned()->change();
            });
        }

        if (Schema::hasTable('purchase_order_items')) {
            Schema::table('purchase_order_items', function (Blueprint $table): void {
                if (Schema::hasColumn('purchase_order_items', 'qty_ordered')) {
                    $table->decimal('qty_ordered', 12, 3)->unsigned()->change();
                }
                if (Schema::hasColumn('purchase_order_items', 'qty_received')) {
                    $table->decimal('qty_received', 12, 3)->unsigned()->default(0)->change();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('purchase_order_items')) {
            Schema::table('purchase_order_items', function (Blueprint $table): void {
                if (Schema::hasColumn('purchase_order_items', 'qty_ordered')) {
                    $table->unsignedInteger('qty_ordered')->change();
                }
                if (Schema::hasColumn('purchase_order_items', 'qty_received')) {
                    $table->unsignedInteger('qty_received')->default(0)->change();
                }
            });
        }

        if (Schema::hasTable('print_jobs_stock_items') && Schema::hasColumn('print_jobs_stock_items', 'qty')) {
            Schema::table('print_jobs_stock_items', function (Blueprint $table): void {
                $table->unsignedInteger('qty')->change();
            });
        }

        if (Schema::hasTable('stock_items')) {
            Schema::table('stock_items', function (Blueprint $table): void {
                if (Schema::hasColumn('stock_items', 'low_stock_qty')) {
                    $table->unsignedInteger('low_stock_qty')->default(10)->change();
                }
                if (Schema::hasColumn('stock_items', 'reorder_qty')) {
                    $table->unsignedInteger('reorder_qty')->default(20)->change();
                }
            });
        }

        if (Schema::hasTable('stock_movements') && Schema::hasColumn('stock_movements', 'qty')) {
            Schema::table('stock_movements', function (Blueprint $table): void {
                $table->unsignedInteger('qty')->change();
            });
        }

        if (Schema::hasTable('grm_items') && Schema::hasColumn('grm_items', 'qty')) {
            Schema::table('grm_items', function (Blueprint $table): void {
                $table->unsignedInteger('qty')->change();
            });
        }

        if (Schema::hasTable('stock') && Schema::hasColumn('stock', 'qty')) {
            Schema::table('stock', function (Blueprint $table): void {
                $table->unsignedInteger('qty')->change();
            });
        }
    }
};
