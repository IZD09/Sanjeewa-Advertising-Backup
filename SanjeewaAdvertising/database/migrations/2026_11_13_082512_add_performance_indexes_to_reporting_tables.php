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
        if (Schema::hasTable('print_jobs')) {
            Schema::table('print_jobs', function (Blueprint $table): void {
                if (Schema::hasColumn('print_jobs', 'add_date')) {
                    $table->index('add_date', 'idx_print_jobs_add_date');
                }
            });
        }

        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table): void {
                if (Schema::hasColumn('payments', 'pay_date')) {
                    $table->index('pay_date', 'idx_payments_pay_date');
                }
            });
        }

        if (Schema::hasTable('grn_payments')) {
            Schema::table('grn_payments', function (Blueprint $table): void {
                if (Schema::hasColumn('grn_payments', 'pay_date')) {
                    $table->index('pay_date', 'idx_grn_payments_pay_date');
                }
            });
        }

        if (Schema::hasTable('expencesess')) {
            Schema::table('expencesess', function (Blueprint $table): void {
                if (Schema::hasColumn('expencesess', 'pay_at')) {
                    $table->index('pay_at', 'idx_expencesess_pay_at');
                }
                if (Schema::hasColumn('expencesess', 'add_date')) {
                    $table->index('add_date', 'idx_expencesess_add_date');
                }
            });
        }

        if (Schema::hasTable('purchase_orders')) {
            Schema::table('purchase_orders', function (Blueprint $table): void {
                if (Schema::hasColumn('purchase_orders', 'add_date')) {
                    $table->index('add_date', 'idx_purchase_orders_add_date');
                }
            });
        }

        if (Schema::hasTable('stock_movements')) {
            Schema::table('stock_movements', function (Blueprint $table): void {
                if (Schema::hasColumn('stock_movements', 'date')) {
                    $table->index('date', 'idx_stock_movements_date');
                }
            });
        }

        if (Schema::hasTable('invoice')) {
            Schema::table('invoice', function (Blueprint $table): void {
                if (Schema::hasColumn('invoice', 'invoice_at')) {
                    $table->index('invoice_at', 'idx_invoice_invoice_at');
                }
                if (Schema::hasColumn('invoice', 'due_date')) {
                    $table->index('due_date', 'idx_invoice_due_date');
                }
            });
        }

        if (Schema::hasTable('stock')) {
            Schema::table('stock', function (Blueprint $table): void {
                if (Schema::hasColumn('stock', 'add_date')) {
                    $table->index('add_date', 'idx_stock_add_date');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('print_jobs')) {
            Schema::table('print_jobs', function (Blueprint $table): void {
                $table->dropIndex('idx_print_jobs_add_date');
            });
        }

        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table): void {
                $table->dropIndex('idx_payments_pay_date');
            });
        }

        if (Schema::hasTable('grn_payments')) {
            Schema::table('grn_payments', function (Blueprint $table): void {
                $table->dropIndex('idx_grn_payments_pay_date');
            });
        }

        if (Schema::hasTable('expencesess')) {
            Schema::table('expencesess', function (Blueprint $table): void {
                $table->dropIndex('idx_expencesess_pay_at');
                $table->dropIndex('idx_expencesess_add_date');
            });
        }

        if (Schema::hasTable('purchase_orders')) {
            Schema::table('purchase_orders', function (Blueprint $table): void {
                $table->dropIndex('idx_purchase_orders_add_date');
            });
        }

        if (Schema::hasTable('stock_movements')) {
            Schema::table('stock_movements', function (Blueprint $table): void {
                $table->dropIndex('idx_stock_movements_date');
            });
        }

        if (Schema::hasTable('invoice')) {
            Schema::table('invoice', function (Blueprint $table): void {
                $table->dropIndex('idx_invoice_invoice_at');
                $table->dropIndex('idx_invoice_due_date');
            });
        }

        if (Schema::hasTable('stock')) {
            Schema::table('stock', function (Blueprint $table): void {
                $table->dropIndex('idx_stock_add_date');
            });
        }
    }
};
