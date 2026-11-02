<?php

namespace Modules\PrintJob\Services;

use Illuminate\Database\Eloquent\Collection;
use Modules\PrintJob\Models\PrintJobStatus;

class PrintJobStatusService
{
    /**
     * Retrieve all available print job statuses.
     *
     * @return Collection<int, PrintJobStatus>
     */
    public function getAllStatuses(): Collection
    {
        return PrintJobStatus::query()->orderBy('id')->get();
    }

    /**
     * Find a status by its ID.
     */
    public function getStatusById(int $id): ?PrintJobStatus
    {
        return PrintJobStatus::query()->find($id);
    }

    /**
     * Create a new print job status.
     *
     * @param  array<string, mixed>  $data
     */
    public function createStatus(array $data): PrintJobStatus
    {
        return PrintJobStatus::create([
            'print_job_states' => trim((string) ($data['print_job_states'] ?? '')),
        ]);
    }

    /**
     * Update an existing print job status.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateStatus(PrintJobStatus $status, array $data): PrintJobStatus
    {
        $status->update([
            'print_job_states' => trim((string) ($data['print_job_states'] ?? $status->print_job_states)),
        ]);

        return $status;
    }

    /**
     * Delete a print job status.
     */
    public function deleteStatus(PrintJobStatus $status): bool
    {
        return (bool) $status->delete();
    }
}
