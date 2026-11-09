<?php

namespace Modules\Inventory\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGrnItemRequest extends FormRequest
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
            'grn_id' => ['required', 'integer', 'exists:grn,id'],
            'item_batches_id' => ['required', 'integer', 'exists:item_batches,id'],
            'stock_id' => ['required', 'integer', 'exists:stock,id'],
            'qty' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'grn_id.required' => 'GRN ID is required.',
            'grn_id.exists' => 'Selected GRN does not exist.',
            'item_batches_id.required' => 'Batch ID is required.',
            'item_batches_id.exists' => 'Selected item batch does not exist.',
            'stock_id.required' => 'Stock ID is required.',
            'stock_id.exists' => 'Selected stock record does not exist.',
            'qty.required' => 'Quantity is required.',
            'qty.min' => 'Quantity must be at least 1.',
        ];
    }
}
