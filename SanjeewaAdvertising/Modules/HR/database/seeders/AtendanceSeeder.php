<?php

namespace Modules\HR\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\HR\Models\Atendance;
use Modules\HR\Models\AtendanceStatus;
use Modules\HR\Models\Staff;
use Modules\HR\Models\WorkDay;

class AtendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statusIds = AtendanceStatus::query()->pluck('id', 'atendance_statuses');

        if (
            ! $statusIds->has('Present')
            || ! $statusIds->has('Absent')
            || ! $statusIds->has('Late')
            || ! $statusIds->has('Half Day')
            || ! $statusIds->has('On Leave')
        ) {
            return;
        }

        $workDays = WorkDay::query()->with('status')->orderBy('date')->get();
        $staffMembers = Staff::query()->with('status')->orderBy('id')->get();

        foreach ($workDays as $workDay) {
            $workDayStatus = $workDay->status?->work_day_status;

            if (! in_array($workDayStatus, ['Working Day', 'Half Day'], true)) {
                continue;
            }

            foreach ($staffMembers as $staff) {
                $staffStatus = $staff->status?->staff_status;

                if ($staffStatus === 'On Leave') {
                    $attendanceStatusId = $statusIds['On Leave'];
                    $inTime = null;
                    $outTime = null;
                } elseif ($staffStatus === 'Active') {
                    if ($workDayStatus === 'Half Day') {
                        $attendanceStatusId = $statusIds['Half Day'];
                        $inTime = '08:30:00';
                        $outTime = '13:00:00';
                    } else {
                        $selector = ($workDay->id + $staff->id) % 10;

                        if ($selector === 0) {
                            $attendanceStatusId = $statusIds['Absent'];
                            $inTime = null;
                            $outTime = null;
                        } elseif ($selector === 3) {
                            $attendanceStatusId = $statusIds['Late'];
                            $inTime = '09:15:00';
                            $outTime = '17:30:00';
                        } elseif ($selector === 6) {
                            $attendanceStatusId = $statusIds['Half Day'];
                            $inTime = '08:30:00';
                            $outTime = '13:00:00';
                        } else {
                            $attendanceStatusId = $statusIds['Present'];
                            $inTime = '08:30:00';
                            $outTime = '17:30:00';
                        }
                    }
                } else {
                    continue;
                }

                Atendance::firstOrCreate(
                    [
                        'work_days_id' => $workDay->id,
                        'staff_id' => $staff->id,
                    ],
                    [
                        'atendance_statuses_id' => $attendanceStatusId,
                        'in' => $inTime,
                        'out' => $outTime,
                    ]
                );
            }
        }
    }
}
