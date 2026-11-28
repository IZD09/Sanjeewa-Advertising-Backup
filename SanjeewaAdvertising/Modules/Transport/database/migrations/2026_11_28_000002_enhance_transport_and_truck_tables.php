<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Enhance truck and transport tables for driver assignment, odometer tracking, and diesel consumption.
     */
    public function up(): void
    {
        if (Schema::hasTable('truck')) {
            Schema::table('truck', function (Blueprint $table): void {
                $table->string('register', 20)->change();

                if (! Schema::hasColumn('truck', 'default_staff_id')) {
                    $table->unsignedBigInteger('default_staff_id')->nullable()->after('model_id');
                    $table->index('default_staff_id', 'fk_truck_default_staff_idx');
                    $table->foreign('default_staff_id', 'fk_truck_default_staff')
                        ->references('id')
                        ->on('staff')
                        ->nullOnDelete()
                        ->cascadeOnUpdate();
                }

                if (! Schema::hasColumn('truck', 'current_km')) {
                    $table->unsignedInteger('current_km')->default(0)->after('default_staff_id');
                }

                if (! Schema::hasColumn('truck', 'fuel_efficiency')) {
                    $table->decimal('fuel_efficiency', 8, 2)->unsigned()->nullable()->after('current_km');
                }

                if (! Schema::hasColumn('truck', 'status')) {
                    $table->string('status', 20)->default('Available')->after('fuel_efficiency');
                }
            });
        }

        if (Schema::hasTable('transport')) {
            Schema::table('transport', function (Blueprint $table): void {
                if (! Schema::hasColumn('transport', 'destination')) {
                    $table->string('destination', 150)->nullable()->after('junry');
                }

                if (! Schema::hasColumn('transport', 'diesel_liters')) {
                    $table->decimal('diesel_liters', 10, 3)->unsigned()->nullable()->after('destination');
                }

                if (! Schema::hasColumn('transport', 'diesel_cost')) {
                    $table->decimal('diesel_cost', 12, 2)->unsigned()->nullable()->after('diesel_liters');
                }

                if (! Schema::hasColumn('transport', 'print_jobs_id')) {
                    $table->unsignedBigInteger('print_jobs_id')->nullable()->after('diesel_cost');
                    $table->index('print_jobs_id', 'fk_transport_print_jobs_idx');
                    $table->foreign('print_jobs_id', 'fk_transport_print_jobs')
                        ->references('id')
                        ->on('print_jobs')
                        ->nullOnDelete()
                        ->cascadeOnUpdate();
                }

                if (! Schema::hasColumn('transport', 'notes')) {
                    $table->string('notes', 255)->nullable()->after('print_jobs_id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('transport')) {
            Schema::table('transport', function (Blueprint $table): void {
                if (Schema::hasColumn('transport', 'print_jobs_id')) {
                    $table->dropForeign('fk_transport_print_jobs');
                    $table->dropIndex('fk_transport_print_jobs_idx');
                    $table->dropColumn('print_jobs_id');
                }

                foreach (['notes', 'diesel_cost', 'diesel_liters', 'destination'] as $col) {
                    if (Schema::hasColumn('transport', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }

        if (Schema::hasTable('truck')) {
            Schema::table('truck', function (Blueprint $table): void {
                if (Schema::hasColumn('truck', 'default_staff_id')) {
                    $table->dropForeign('fk_truck_default_staff');
                    $table->dropIndex('fk_truck_default_staff_idx');
                    $table->dropColumn('default_staff_id');
                }

                foreach (['status', 'fuel_efficiency', 'current_km'] as $col) {
                    if (Schema::hasColumn('truck', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
