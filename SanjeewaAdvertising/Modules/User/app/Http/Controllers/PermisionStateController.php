<?php

namespace Modules\User\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\User\Http\Requests\PermisionState\StorePermisionStateRequest;
use Modules\User\Http\Requests\PermisionState\UpdatePermisionStateRequest;
use Modules\User\Services\PermisionStateService;
use Modules\User\Transformers\PermisionStateResource;

class PermisionStateController extends BaseApiController
{
    public function __construct(
        protected PermisionStateService $stateService
    ) {}

    /**
     * Display a listing of permission states.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $states = $this->stateService->getAllStates();

            return $this->success(
                PermisionStateResource::collection($states),
                'All permission states retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $states = $this->stateService->getPaginatedStates($perPage);
        $states->through(fn ($state) => new PermisionStateResource($state));

        return $this->paginated($states, 'Permission states retrieved successfully.');
    }

    /**
     * Store a newly created permission state.
     */
    public function store(StorePermisionStateRequest $request): JsonResponse
    {
        $state = $this->stateService->createState($request->validated());

        return $this->created(
            new PermisionStateResource($state),
            'Permission state created successfully.'
        );
    }

    /**
     * Display the specified permission state.
     */
    public function show(int $id): JsonResponse
    {
        $state = $this->stateService->findById($id);

        if (! $state) {
            return $this->notFound('Permission state not found.');
        }

        return $this->success(
            new PermisionStateResource($state),
            'Permission state retrieved successfully.'
        );
    }

    /**
     * Update the specified permission state.
     */
    public function update(UpdatePermisionStateRequest $request, int $id): JsonResponse
    {
        $state = $this->stateService->findById($id);

        if (! $state) {
            return $this->notFound('Permission state not found.');
        }

        $updated = $this->stateService->updateState($state, $request->validated());

        return $this->success(
            new PermisionStateResource($updated),
            'Permission state updated successfully.'
        );
    }

    /**
     * Remove the specified permission state.
     */
    public function destroy(int $id): JsonResponse
    {
        $state = $this->stateService->findById($id);

        if (! $state) {
            return $this->notFound('Permission state not found.');
        }

        $this->stateService->deleteState($state);

        return $this->success(null, 'Permission state deleted successfully.');
    }
}
