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
        return [
            'id' => $this->id,
            'name' => $this->name,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'register_at' => $this->register_at?->toIso8601String() ?? $this->register_at,
            'print_jobs_count' => $this->whenCounted('printJobs'),
            'invoices_count' => $this->whenCounted('invoices'),
            'print_jobs' => $this->whenLoaded('printJobs'),
            'invoices' => $this->whenLoaded('invoices'),
        ];
    }
}
