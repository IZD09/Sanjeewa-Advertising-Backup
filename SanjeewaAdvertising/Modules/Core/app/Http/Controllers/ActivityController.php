<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Requests\StoreActivityRequest;
use Modules\Core\Services\ActivityService;
use Modules\Core\Transformers\ActivityResource;
use Modules\Core\Transformers\ActivityTypeResource;

class ActivityController extends BaseApiController
{
    public function __construct(
        protected ActivityService $activityService
    ) {
    }

    /**
     * Display a listing of activities.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $activities = $this->activityService->getAllActivities($request->query());

            return $this->success(
                ActivityResource::collection($activities),
                'All activities retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $activities = $this->activityService->getActivities($request->query(), $perPage);

        $activities->through(fn ($item) => new ActivityResource($item));

        return $this->paginated($activities, 'Activities retrieved successfully.');
    }

    /**
     * Store a newly created audit activity log.
     */
    public function store(StoreActivityRequest $request): JsonResponse
    {
        $activity = $this->activityService->logActivity($request->validated());

        return $this->created(
            new ActivityResource($activity),
            'Activity recorded successfully.'
        );
    }

    /**
     * Display the specified activity.
     */
    public function show(int $id): JsonResponse
    {
        $activity = $this->activityService->getActivityById($id);

        if (! $activity) {
            return $this->notFound('Activity not found.');
        }

        return $this->success(
            new ActivityResource($activity),
            'Activity details retrieved successfully.'
        );
    }

    /**
     * Retrieve all activity types.
     */
    public function types(): JsonResponse
    {
        $types = $this->activityService->getAllActivityTypes();

        return $this->success(
            ActivityTypeResource::collection($types),
            'Activity types retrieved successfully.'
        );
    }
}
