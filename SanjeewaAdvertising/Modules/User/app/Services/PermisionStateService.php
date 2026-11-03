<?php

namespace Modules\User\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Modules\User\Models\PermisionState;

class PermisionStateService
{
    /**
     * Retrieve all permission states.
     *
     * @return Collection<int, PermisionState>
     */
    public function getAllStates(): Collection
    {
        return PermisionState::query()
            ->orderBy('id', 'asc')
            ->get();
    }

    /**
     * Retrieve paginated permission states.
     *
     * @return LengthAwarePaginator<PermisionState>
     */
    public function getPaginatedStates(int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return PermisionState::query()
            ->orderBy('id', 'asc')
            ->paginate($perPage);
    }

    /**
     * Find a permission state by ID.
     */
    public function findById(int $id): ?PermisionState
    {
        return PermisionState::query()->find($id);
    }

    /**
     * Create a new permission state.
     *
     * @param  array{permision_states: string}  $data
     */
    public function createState(array $data): PermisionState
    {
        return PermisionState::create([
            'permision_states' => $data['permision_states'],
        ]);
    }

    /**
     * Update an existing permission state.
     *
     * @param  array{permision_states: string}  $data
     */
    public function updateState(PermisionState $state, array $data): PermisionState
    {
        $state->update([
            'permision_states' => $data['permision_states'],
        ]);

        return $state;
    }

    /**
     * Delete a permission state.
     */
    public function deleteState(PermisionState $state): bool
    {
        $state->userPermissions()->delete();

        return (bool) $state->delete();
    }
}
