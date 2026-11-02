<?php

namespace Modules\Transaction\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
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
            'payment' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'payment_types_id' => ['sometimes', 'required', 'integer', 'exists:payment_types,id'],
            'payment_statuses_id' => ['sometimes', 'required', 'integer', 'exists:payment_statuses,id'],
            'pay_date' => ['sometimes', 'required', 'date'],
        ];
    }
}
