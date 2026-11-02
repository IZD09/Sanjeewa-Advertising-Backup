<?php

namespace Modules\Invoice\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Customer\Transformers\CustomerResource;
use Modules\Invoice\Models\Invoice;
use Modules\PrintJob\Transformers\PrintJobResource;

/**
 * @mixin Invoice
 */
class InvoiceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'invoice_at' => $this->invoice_at?->toIso8601String() ?? $this->invoice_at,
            'due_date' => $this->due_date?->toIso8601String() ?? $this->due_date,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'print_jobs' => PrintJobResource::collection($this->whenLoaded('printJobs')),
            'print_jobs_count' => $this->whenCounted('printJobs'),
        ];
    }
}
