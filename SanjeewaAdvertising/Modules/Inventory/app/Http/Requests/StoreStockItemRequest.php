<?php

namespace Modules\Inventory\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStockItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $mergeData = [];
        if ($this->has('name') && is_string($this->input('name'))) {
            $mergeData['name'] = trim($this->input('name'));
        }
        if ($this->has('code') && is_string($this->input('code'))) {
            $mergeData['code'] = strtoupper(trim($this->input('code')));
        }
        if (! empty($mergeData)) {
            $this->merge($mergeData);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:50'],
            'code' => ['nullable', 'string', 'min:2', 'max:50', 'unique:stock_items,code'],
            'subcategories_id' => ['required', 'integer', 'exists:subcategories,id'],
            'brands' => ['required', 'array', 'min:1'],
            'brands.*' => ['integer', 'exists:brands,id'],
            'low_stock_qty' => ['nullable', 'integer', 'min:0'],
            'reorder_qty' => ['nullable', 'integer', 'min:0'],
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
            'name.required' => 'Stock item name is required.',
            'name.max' => 'Stock item name must not exceed 50 characters.',
            'code.unique' => 'This item code already exists in catalog.',
            'subcategories_id.required' => 'Please select a subcategory.',
            'subcategories_id.exists' => 'Selected subcategory does not exist.',
            'brands.required' => 'At least one brand must be selected.',
            'brands.min' => 'At least one brand must be selected.',
            'brands.*.exists' => 'Selected brand does not exist.',
        ];
    }
}
