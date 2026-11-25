<?php

namespace Modules\Customer\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Customer\Models\Customer;

/**
 * @mixin Customer
 */
class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $ordersCount = (int) ($this->print_jobs_count ?? $this->printJobs()->count());
        $spent = (float) $this->payments()->sum('payment');
        [$pendingBalance, $pendingOrdersCount] = $this->calculatePendingReceivables();

        $location = 'Colombo';
        if ($this->email && str_contains($this->email, '.')) {
            $parts = explode('@', $this->email);
            $location = ucfirst(explode('.', $parts[0])[1] ?? 'Colombo');
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'location' => $location,
            'badge' => $this->badge,
            'total_orders' => $ordersCount,
            'print_jobs_count' => $ordersCount,
            'total_spent' => round($spent, 2),
            'pending_balance' => round($pendingBalance, 2),
            'pending_orders_count' => $pendingOrdersCount,
            'register_at' => $this->register_at?->toIso8601String() ?? $this->register_at,
            'invoices_count' => $this->whenCounted('invoices'),
            'print_jobs' => $this->whenLoaded('printJobs'),
            'invoices' => $this->whenLoaded('invoices'),
        ];
    }

    /**
     * Calculate total remaining balance due and count of unpaid/partial print jobs for this customer.
     *
     * @return array{0: float, 1: int}
     */
    protected function calculatePendingReceivables(): array
    {
        if (! $this->relationLoaded('printJobs')) {
            return [0.0, 0];
        }

        $pendingBalance = 0.0;
        $pendingOrdersCount = 0;

        foreach ($this->printJobs as $job) {
            $statusId = (int) ($job->latestStatusHistory?->print_job_statuses_id ?? 1);
            if ($statusId === 9) {
                continue; // Skip cancelled jobs
            }

            $costSum = (float) ($job->cost?->printCosts?->sum('price') ?? 0);
            $unitPrice = $costSum > 0 ? $costSum : 120.00;
            $qty = max(1, (int) $job->qty);
            $width = (float) ($job->wtdth > 0 ? $job->wtdth : 10);
            $height = (float) ($job->hight > 0 ? $job->hight : 4);
            $unitSymbol = strtolower((string) ($job->unit?->simble ?? 'ft'));

            if ($unitSymbol === 'pcs') {
                $subtotal = $unitPrice * $qty;
            } else {
                $areaSqFt = match ($unitSymbol) {
                    'in', 'inches' => ($width * $height) / 144,
                    'cm' => ($width * $height) / 929.0304,
                    'mm' => ($width * $height) / 92903.04,
                    'm', 'meters' => ($width * $height) * 10.7639,
                    default => ($width * $height),
                };
                $subtotal = $areaSqFt * $unitPrice * $qty;
            }

            $discount = (float) ($job->cost?->discount ?? 0);
            $totalBill = max(0.0, $subtotal - $discount);
            $paidAmount = (float) $job->payments->sum('payment');
            $balanceDue = max(0.0, $totalBill - $paidAmount);

            if ($balanceDue > 0.009) {
                $pendingBalance += $balanceDue;
                $pendingOrdersCount++;
            }
        }

        return [$pendingBalance, $pendingOrdersCount];
    }
}
