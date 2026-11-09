<?php

namespace Modules\Inventory\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSubcategoryRequest extends FormRequest
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
        if ($this->has('subcategory') && is_string($this->input('subcategory'))) {
            $this->merge([
                'subcategory' => trim($this->input('subcategory')),
            ]);
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
            'subcategory' => ['required', 'string', 'min:2', 'max:50', 'unique:subcategories,subcategory'],
            'categories_id' => ['required', 'integer', 'exists:categories,id'],
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
            'subcategory.required' => 'Subcategory name is required.',
            'subcategory.min' => 'Subcategory name must be at least 2 characters.',
            'subcategory.max' => 'Subcategory name must not exceed 50 characters.',
            'subcategory.unique' => 'This subcategory name already exists.',
            'categories_id.required' => 'Parent category is required.',
            'categories_id.integer' => 'Selected parent category is invalid.',
            'categories_id.exists' => 'Selected parent category does not exist.',
        ];
    }
}
