<?php

namespace Modules\HR\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\HR\Http\Requests\StoreStaffRequest;
use Modules\HR\Http\Requests\UpdateStaffStatusRequest;
use Modules\HR\Services\StaffService;
use Modules\HR\Transformers\StaffResource;

class StaffController extends BaseApiController
{
    public function __construct(
        protected StaffService $staffService
    ) {}

    /**
     * Display a listing of all staff members.
     */
    public function index(Request $request): JsonResponse
    {
        $staffMembers = $this->staffService->getAllStaff($request->query());

        return $this->success(
            StaffResource::collection($staffMembers),
            'Staff members retrieved successfully.'
        );
    }

    /**
     * Store a newly registered staff member with default Active status.
     */
    public function store(StoreStaffRequest $request): JsonResponse
    {
        $adminId = Auth::guard('admin')->id();
        $staff = $this->staffService->createStaff($request->validated(), $adminId ? (int) $adminId : null);

        return $this->created(
            new StaffResource($staff),
            'Staff member added successfully.'
        );
    }

    /**
     * Display a single staff member record.
     */
    public function show(int $id): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (! $staff) {
            return $this->notFound('Staff member not found.');
        }

        return $this->success(
            new StaffResource($staff),
            'Staff member retrieved successfully.'
        );
    }

    /**
     * Update a staff member's employment status.
     */
    public function updateStatus(UpdateStaffStatusRequest $request, int $id): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (! $staff) {
            return $this->notFound('Staff member not found.');
        }

        $adminId = Auth::guard('admin')->id();
        $updatedStaff = $this->staffService->updateStaffStatus(
            $id,
            (int) $request->validated('staff_statuses_id'),
            $adminId ? (int) $adminId : null
        );

        return $this->success(
            new StaffResource($updatedStaff),
            'Staff status updated successfully.'
        );
    }
}
