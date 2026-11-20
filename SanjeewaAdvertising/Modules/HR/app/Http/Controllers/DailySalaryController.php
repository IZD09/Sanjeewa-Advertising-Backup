<?php

namespace Modules\HR\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\HR\Http\Requests\StoreDailySalaryRequest;
use Modules\HR\Services\DailySalaryService;
use Modules\HR\Transformers\DailySalaryResource;

class DailySalaryController extends BaseApiController
{
    public function __construct(
        protected DailySalaryService $dailySalaryService
    ) {}

    /**
     * Display a listing of all daily salary payment records.
     */
    public function index(Request $request): JsonResponse
    {
        $dailySalaries = $this->dailySalaryService->getAllDailySalaries($request->query());

        return $this->success(
            DailySalaryResource::collection($dailySalaries),
            'Daily salary payments retrieved successfully.'
        );
    }

    /**
     * Store a newly recorded daily salary payment for a staff member.
     */
    public function store(StoreDailySalaryRequest $request): JsonResponse
    {
        $adminId = Auth::guard('admin')->id();
        $dailySalary = $this->dailySalaryService->recordDailySalary(
            $request->validated(),
            $adminId ? (int) $adminId : null
        );

        return $this->created(
            new DailySalaryResource($dailySalary),
            'Daily salary payment recorded successfully.'
        );
    }
}
