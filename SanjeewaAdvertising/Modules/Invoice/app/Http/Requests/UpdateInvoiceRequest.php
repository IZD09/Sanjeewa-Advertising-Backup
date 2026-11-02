<?php

namespace Modules\Invoice\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceRequest extends FormRequest
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
            'customer_id' => ['sometimes', 'required', 'integer', 'exists:customer,id'],
            'invoice_at' => ['sometimes', 'required', 'date'],
            'due_date' => ['sometimes', 'required', 'date'],
            'print_job_ids' => ['nullable', 'array'],
            'print_job_ids.*' => ['integer', 'exists:print_jobs,id'],
        ];
    }
}
