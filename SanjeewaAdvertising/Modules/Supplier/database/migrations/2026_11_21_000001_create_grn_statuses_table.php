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
        if (! Schema::hasTable('grn_statuses')) {
            Schema::create('grn_statuses', function (Blueprint $table) {
                $table->tinyIncrements('id');
                $table->string('grn_status', 45)->unique('grn_status_UNIQUE');
            });
        }

        // Seed default GRN statuses immediately so foreign key constraints and data migration succeed
        $statuses = [
            1 => 'Draft',
            2 => 'Approved',
            3 => 'Completed',
            4 => 'Cancelled',
            5 => 'Pending',
        ];

        foreach ($statuses as $id => $name) {
            DB::table('grn_statuses')->updateOrInsert(
                ['id' => $id],
                ['grn_status' => $name]
            );
        }

        if (Schema::hasTable('grn')) {
            if (! Schema::hasColumn('grn', 'grn_statuses_id')) {
                Schema::table('grn', function (Blueprint $table) {
                    $table->unsignedTinyInteger('grn_statuses_id')
                        ->default(1)
                        ->after('at_time');

                    $table->index('grn_statuses_id', 'fk_grn_grn_statuses1_idx');

                    $table->foreign('grn_statuses_id', 'fk_grn_grn_statuses1')
                        ->references('id')
                        ->on('grn_statuses')
                        ->onDelete('no action')
                        ->onUpdate('no action');
                });
            }

            // Migrate existing status string values to grn_statuses_id before dropping the status column
            if (Schema::hasColumn('grn', 'status')) {
                $statusMap = [
                    'draft' => 1,
                    'approved' => 2,
                    'completed' => 3,
                    'cancelled' => 4,
                    'pending' => 5,
                ];

                $existingGrns = DB::table('grn')->select('id', 'status')->get();
                foreach ($existingGrns as $row) {
                    $key = strtolower(trim((string) ($row->status ?? 'draft')));
                    $mappedId = $statusMap[$key] ?? 1;
                    DB::table('grn')->where('id', $row->id)->update(['grn_statuses_id' => $mappedId]);
                }

                Schema::table('grn', function (Blueprint $table) {
                    $table->dropColumn('status');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('grn')) {
            if (! Schema::hasColumn('grn', 'status')) {
                Schema::table('grn', function (Blueprint $table) {
                    $table->string('status', 30)->default('Draft')->after('at_time');
                });

                if (Schema::hasColumn('grn', 'grn_statuses_id') && Schema::hasTable('grn_statuses')) {
                    $statuses = DB::table('grn_statuses')->pluck('grn_status', 'id')->all();
                    $grns = DB::table('grn')->select('id', 'grn_statuses_id')->get();
                    foreach ($grns as $row) {
                        $statusName = $statuses[$row->grn_statuses_id] ?? 'Draft';
                        DB::table('grn')->where('id', $row->id)->update(['status' => $statusName]);
                    }
                }
            }

            if (Schema::hasColumn('grn', 'grn_statuses_id')) {
                Schema::table('grn', function (Blueprint $table) {
                    $table->dropForeign('fk_grn_grn_statuses1');
                    $table->dropIndex('fk_grn_grn_statuses1_idx');
                    $table->dropColumn('grn_statuses_id');
                });
            }
        }

        Schema::dropIfExists('grn_statuses');
    }
};
