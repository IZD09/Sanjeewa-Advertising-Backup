<?php

namespace Modules\Inventory\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBrandRequest extends FormRequest
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
        if ($this->has('brand') && is_string($this->input('brand'))) {
            $this->merge([
                'brand' => trim($this->input('brand')),
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
            'brand' => ['required', 'string', 'min:2', 'max:50', 'unique:brands,brand'],
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
            'brand.required' => 'Brand name is required.',
            'brand.min' => 'Brand name must be at least 2 characters.',
            'brand.max' => 'Brand name must not exceed 50 characters.',
            'brand.unique' => 'This brand name already exists.',
        ];
    }
}
