<?php

namespace Modules\Supplier\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupplierRequest extends FormRequest
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
        $supplierId = $this->route('supplier') ?? $this->route('id') ?? $this->input('id');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('suppliers', 'name')->ignore($supplierId),
            ],
            'mobile' => [
                'sometimes',
                'required',
                'string',
                'max:15',
                Rule::unique('suppliers', 'mobile')->ignore($supplierId),
            ],
            'email' => [
                'nullable',
                'email',
                'max:100',
                Rule::unique('suppliers', 'email')->ignore($supplierId),
            ],
            'bank_account' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('suppliers', 'bank_account')->ignore($supplierId),
            ],
        ];
    }

    /**
     * Custom validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Supplier / Company name is required.',
            'name.unique' => 'A supplier with this company name already exists.',
            'mobile.required' => 'Mobile number is required.',
            'mobile.unique' => 'A supplier with this mobile number already exists.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'A supplier with this email address already exists.',
        ];
    }
}
