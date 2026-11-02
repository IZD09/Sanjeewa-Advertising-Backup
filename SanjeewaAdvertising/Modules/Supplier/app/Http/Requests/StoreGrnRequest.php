<?php

namespace Modules\Supplier\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGrnRequest extends FormRequest
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
            'at_time' => ['nullable', 'date'],
            'purchase_orders_id' => ['nullable', 'integer', 'exists:purchase_orders,id'],
            'supplyer_invoice' => ['nullable', 'string', 'max:50'],
            'stocks' => ['nullable', 'array'],
            'stocks.*.stock_items_id' => ['required_with:stocks', 'integer', 'exists:stock_items,id'],
            'stocks.*.brands_id' => ['required_with:stocks', 'integer', 'exists:brands,id'],
            'stocks.*.qty' => ['required_with:stocks', 'integer', 'min:1'],
            'stocks.*.price' => ['required_with:stocks', 'numeric', 'min:0'],
            'stocks.*.buy' => ['required_with:stocks', 'numeric', 'min:0'],
        ];
    }
}
