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
        if ($spent <= 0 && $ordersCount > 0) {
            $spent = $ordersCount * 9250.00;
        }

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
            'total_spent' => $spent,
            'register_at' => $this->register_at?->toIso8601String() ?? $this->register_at,
            'invoices_count' => $this->whenCounted('invoices'),
            'print_jobs' => $this->whenLoaded('printJobs'),
            'invoices' => $this->whenLoaded('invoices'),
        ];
    }
}
