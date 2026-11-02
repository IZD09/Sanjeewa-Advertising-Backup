<?php

namespace Modules\Design\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePrintCostRequest extends FormRequest
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
            'print_cost_type_id' => ['sometimes', 'required', 'integer', 'exists:print_cost_type,id'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'add_at' => ['sometimes', 'required', 'date'],
        ];
    }
}
