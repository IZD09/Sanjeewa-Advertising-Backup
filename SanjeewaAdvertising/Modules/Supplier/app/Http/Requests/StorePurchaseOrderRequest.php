<?php

namespace Modules\Supplier\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
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
            'suppliers_id' => ['required', 'integer', 'exists:suppliers,id'],
            'add_date' => ['nullable', 'date'],
            'items' => ['nullable', 'array'],
            'items.*.stock_items_id' => ['required_with:items', 'integer', 'exists:stock_items,id'],
            'items.*.unit_cost' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.qty_ordered' => ['required_with:items', 'integer', 'min:1'],
            'items.*.qty_received' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
