<?php

namespace Modules\HR\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\HR\Http\Requests\StoreSalaryRequest;
use Modules\HR\Services\SalaryService;
use Modules\HR\Transformers\SalaryResource;

class SalaryController extends BaseApiController
{
    public function __construct(
        protected SalaryService $salaryService
    ) {}

    /**
     * Display a listing of all base salary records.
     */
    public function index(Request $request): JsonResponse
    {
        $salaries = $this->salaryService->getAllSalaries($request->query());

        return $this->success(
            SalaryResource::collection($salaries),
            'Base salary records retrieved successfully.'
        );
    }

    /**
     * Store a newly set or updated monthly base salary for a staff member.
     */
    public function store(StoreSalaryRequest $request): JsonResponse
    {
        $adminId = Auth::guard('admin')->id();
        $salary = $this->salaryService->setBaseSalary(
            $request->validated(),
            $adminId ? (int) $adminId : null
        );

        return $this->created(
            new SalaryResource($salary),
            'Base salary updated successfully.'
        );
    }
}
