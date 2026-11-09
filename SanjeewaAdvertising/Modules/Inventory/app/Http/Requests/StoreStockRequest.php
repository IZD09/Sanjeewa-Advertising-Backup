<?php

namespace Modules\Inventory\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'stock_items_id' => ['required', 'integer', 'exists:stock_items,id'],
            'brands_id' => ['required', 'integer', 'exists:brands,id'],
            'qty' => ['required', 'integer', 'min:1'],
            'buy' => ['required', 'numeric', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'grn_id' => ['required', 'integer', 'exists:grn,id'],
            'batch_id' => ['nullable', 'integer', 'exists:item_batches,id'],
            'create_new_batch' => ['nullable', 'boolean'],
            'add_date' => ['nullable', 'date'],
        ];
    }

    /**
     * Custom attribute names for validation errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'stock_items_id' => 'material item',
            'brands_id' => 'brand',
            'qty' => 'quantity',
            'buy' => 'purchase cost',
            'price' => 'selling price',
            'grn_id' => 'GRN reference',
            'batch_id' => 'batch number',
        ];
    }
}
