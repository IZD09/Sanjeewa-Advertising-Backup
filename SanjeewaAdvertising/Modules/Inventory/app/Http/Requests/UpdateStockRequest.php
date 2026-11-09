<?php

namespace Modules\Inventory\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStockRequest extends FormRequest
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
            'stock_id' => ['nullable', 'integer', 'exists:stock,id'],
            'stock_items_id' => ['nullable', 'integer', 'exists:stock_items,id'],
            'brands_id' => ['nullable', 'integer', 'exists:brands,id'],
            'qty' => ['required', 'integer', 'min:1'],
            'buy' => ['nullable', 'numeric', 'min:0'],
            'price' => ['nullable', 'numeric', 'min:0'],
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
            'stock_id' => 'existing stock record',
            'qty' => 'received quantity',
            'buy' => 'purchase cost',
            'price' => 'selling price',
            'grn_id' => 'GRN reference',
            'batch_id' => 'batch number',
        ];
    }
}
