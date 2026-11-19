<?php

namespace Modules\User\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\User\Http\Requests\SystemModule\StoreSystemModuleRequest;
use Modules\User\Http\Requests\SystemModule\UpdateSystemModuleRequest;
use Modules\User\Services\SystemModuleService;
use Modules\User\Transformers\SystemModuleResource;

class SystemModuleController extends BaseApiController
{
    public function __construct(
        protected SystemModuleService $moduleService
    ) {
    }

    /**
     * Display a listing of system modules.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $modules = $this->moduleService->getAllModules();

            return $this->success(
                SystemModuleResource::collection($modules),
                'All system modules retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $modules = $this->moduleService->getPaginatedModules($perPage);
        $modules->through(fn ($module) => new SystemModuleResource($module));

        return $this->paginated($modules, 'System modules retrieved successfully.');
    }

    /**
     * Store a newly created system module.
     */
    public function store(StoreSystemModuleRequest $request): JsonResponse
    {
        $module = $this->moduleService->createModule($request->validated());

        return $this->created(
            new SystemModuleResource($module),
            'System module created successfully.'
        );
    }

    /**
     * Display the specified system module.
     */
    public function show(int $id): JsonResponse
    {
        $module = $this->moduleService->findById($id);

        if (! $module) {
            return $this->notFound('System module not found.');
        }

        return $this->success(
            new SystemModuleResource($module),
            'System module retrieved successfully.'
        );
    }

    /**
     * Update the specified system module.
     */
    public function update(UpdateSystemModuleRequest $request, int $id): JsonResponse
    {
        $module = $this->moduleService->findById($id);

        if (! $module) {
            return $this->notFound('System module not found.');
        }

        $updated = $this->moduleService->updateModule($module, $request->validated());

        return $this->success(
            new SystemModuleResource($updated),
            'System module updated successfully.'
        );
    }

    /**
     * Remove the specified system module.
     */
    public function destroy(int $id): JsonResponse
    {
        $module = $this->moduleService->findById($id);

        if (! $module) {
            return $this->notFound('System module not found.');
        }

        $this->moduleService->deleteModule($module);

        return $this->success(null, 'System module deleted successfully.');
    }
}
