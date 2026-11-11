<?php

namespace Modules\Invoice\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customer,id'],
            'invoice_at' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'print_job_ids' => ['nullable', 'array'],
            'print_job_ids.*' => ['integer', 'exists:print_jobs,id'],
            'payment_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_types_id' => ['nullable', 'integer', 'exists:payment_types,id'],
            'payment_statuses_id' => ['nullable', 'integer', 'exists:payment_statuses,id'],
            'stage' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
            'allocations' => ['nullable', 'array'],
        ];
    }
}
