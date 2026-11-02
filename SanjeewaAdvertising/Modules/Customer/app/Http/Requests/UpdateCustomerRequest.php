<?php

namespace Modules\Customer\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
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
        $customerId = $this->route('customer') ?? $this->route('id') ?? $this->input('id');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'mobile' => [
                'sometimes',
                'required',
                'string',
                'max:15',
                Rule::unique('customer', 'mobile')->ignore($customerId),
            ],
            'email' => [
                'nullable',
                'email',
                'max:100',
                Rule::unique('customer', 'email')->ignore($customerId),
            ],
            'register_at' => ['sometimes', 'required', 'date'],
        ];
    }
}
