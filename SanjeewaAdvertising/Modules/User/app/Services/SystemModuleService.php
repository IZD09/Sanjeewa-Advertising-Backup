<?php

namespace Modules\User\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Modules\User\Models\SystemModule;

class SystemModuleService
{
    /**
     * Retrieve all system modules.
     *
     * @return Collection<int, SystemModule>
     */
    public function getAllModules(): Collection
    {
        return SystemModule::query()
            ->withCount('users')
            ->orderBy('id', 'asc')
            ->get();
    }

    /**
     * Retrieve paginated system modules.
     *
     * @return LengthAwarePaginator<SystemModule>
     */
    public function getPaginatedModules(int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return SystemModule::query()
            ->withCount('users')
            ->orderBy('id', 'asc')
            ->paginate($perPage);
    }

    /**
     * Find a system module by ID.
     */
    public function findById(int $id): ?SystemModule
    {
        return SystemModule::query()
            ->withCount('users')
            ->find($id);
    }

    /**
     * Create a new system module.
     *
     * @param  array{system_module: string}  $data
     */
    public function createModule(array $data): SystemModule
    {
        return SystemModule::create([
            'system_module' => $data['system_module'],
        ]);
    }

    /**
     * Update an existing system module.
     *
     * @param  array{system_module: string}  $data
     */
    public function updateModule(SystemModule $module, array $data): SystemModule
    {
        $module->update([
            'system_module' => $data['system_module'],
        ]);

        return $module;
    }

    /**
     * Delete a system module.
     */
    public function deleteModule(SystemModule $module): bool
    {
        $module->userPermissions()->delete();

        return (bool) $module->delete();
    }
}
