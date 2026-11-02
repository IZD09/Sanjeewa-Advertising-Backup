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
            'name' => ['sometimes', 'required', 'string', 'max:50'],
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
        ];
    }
}
