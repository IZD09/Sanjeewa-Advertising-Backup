<?php

namespace Modules\HR\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Modules\HR\Models\DalySalary;
use Modules\HR\Models\Salary;
use Modules\HR\Models\Staff;
use Modules\HR\Models\StaffStatus;

class HRController extends Controller
{
    /**
     * Display the HR & Payroll Management page.
     */
    public function index(): View
    {
        $staffStatuses = StaffStatus::query()->orderBy('id')->get();

        $staffMembers = Staff::query()
            ->with([
                'status',
                'addedBy',
                'salaries' => fn ($query) => $query->orderByDesc('update_at')->orderByDesc('id'),
                'dailySalaries' => fn ($query) => $query->orderByDesc('pay_at')->orderByDesc('id'),
            ])
            ->orderByDesc('add_at')
            ->orderByDesc('id')
            ->get();

        $salaries = Salary::query()
            ->with(['staff.status'])
            ->orderByDesc('update_at')
            ->orderByDesc('id')
            ->get();

        $dailySalaries = DalySalary::query()
            ->with(['staff.status'])
            ->orderByDesc('pay_at')
            ->orderByDesc('id')
            ->get();

        $activeCount = $staffMembers->filter(
            fn (Staff $member): bool => strtolower((string) ($member->status?->staff_status ?? '')) === 'active'
        )->count();

        $onLeaveCount = $staffMembers->filter(
            fn (Staff $member): bool => strtolower((string) ($member->status?->staff_status ?? '')) === 'on leave'
        )->count();

        $monthlyPayrollTotal = $staffMembers->sum(function (Staff $member): float {
            $latestSalary = $member->salaries->first();

            return $latestSalary ? (float) $latestSalary->amount : 0.0;
        });

        $dailySalaryTotal = (float) $dailySalaries->sum('amount');
        $todayDate = today()->toDateString();
        $todayDailySalaries = $dailySalaries->filter(
            fn (DalySalary $payment): bool => $payment->pay_at?->toDateString() === $todayDate
        );

        return view('ui::layouts.admin.pages.hr-management.hr-management', [
            'staffStatuses' => $staffStatuses,
            'staffMembers' => $staffMembers,
            'salaries' => $salaries,
            'dailySalaries' => $dailySalaries,
            'kpi' => [
                'total_staff' => $staffMembers->count(),
                'active_staff' => $activeCount,
                'on_leave_staff' => $onLeaveCount,
                'monthly_payroll_total' => $monthlyPayrollTotal,
                'daily_salary_total' => $dailySalaryTotal,
                'daily_salary_count' => $dailySalaries->count(),
                'today_daily_salary_total' => (float) $todayDailySalaries->sum('amount'),
                'today_daily_salary_count' => $todayDailySalaries->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        return view('hr::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): void {}

    /**
     * Show the specified resource.
     */
    public function show(int $id): View
    {
        return view('hr::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $id): View
    {
        return view('hr::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): void {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): void {}
}
