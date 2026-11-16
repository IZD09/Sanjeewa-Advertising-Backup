<?php

namespace Modules\Transaction\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGrnPaymentRequest extends FormRequest
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
            'payment' => ['required', 'numeric', 'min:0'],
            'grn_id' => ['nullable', 'integer'],
            'supplier_id' => ['nullable', 'integer'],
            'purchase_order_ids' => ['nullable', 'array'],
            'purchase_order_ids.*' => ['integer', 'exists:purchase_orders,id'],
            'payment_types_id' => ['required', 'integer', 'exists:payment_types,id'],
            'payment_statuses_id' => ['required', 'integer', 'exists:payment_statuses,id'],
            'pay_date' => ['nullable', 'date'],
            'po_numbers' => ['nullable', 'array'],
            'notes' => ['nullable', 'string', 'max:500'],
            'allocations' => ['nullable', 'array'],
        ];
    }
}
