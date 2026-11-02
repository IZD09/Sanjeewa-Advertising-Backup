<?php

namespace Modules\Transaction\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
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
            'payment' => ['required', 'numeric', 'min:0.01'],
            'print_jobs_id' => ['required', 'integer', 'exists:print_jobs,id'],
            'payment_types_id' => ['required', 'integer', 'exists:payment_types,id'],
            'payment_statuses_id' => ['required', 'integer', 'exists:payment_statuses,id'],
            'pay_date' => ['nullable', 'date'],
        ];
    }
}
