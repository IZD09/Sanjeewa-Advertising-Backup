<?php

namespace Modules\HR\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\HR\Models\WorkDay;
use Modules\HR\Models\WorkDayStatus;

class WorkDaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workingDayId = WorkDayStatus::where('work_day_status', 'Working Day')->value('id');
        $halfDayId = WorkDayStatus::where('work_day_status', 'Half Day')->value('id');
        $weekendId = WorkDayStatus::where('work_day_status', 'Weekend')->value('id');

        if (! $workingDayId || ! $halfDayId || ! $weekendId) {
            return;
        }

        for ($offset = 9; $offset >= 0; $offset--) {
            $date = now()->startOfDay()->subDays($offset);
            $dateString = $date->toDateString();

            $statusId = match (true) {
                $date->isSunday() => $weekendId,
                $date->isSaturday() => $halfDayId,
                default => $workingDayId,
            };

            $exists = WorkDay::query()->whereDate('date', $dateString)->exists();

            if (! $exists) {
                WorkDay::create([
                    'date' => $dateString,
                    'work_day_statuses_id' => $statusId,
                ]);
            }
        }
    }
}
