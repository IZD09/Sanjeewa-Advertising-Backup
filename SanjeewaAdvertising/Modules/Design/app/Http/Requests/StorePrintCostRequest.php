<?php

namespace Modules\Design\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePrintCostRequest extends FormRequest
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
            'print_cost_type_id' => ['required_without:print_types_id', 'nullable', 'integer', 'exists:print_cost_type,id'],
            'print_types_id' => ['required_without:print_cost_type_id', 'nullable', 'integer', 'exists:print_types,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'add_at' => ['nullable', 'date'],
        ];
    }
}
