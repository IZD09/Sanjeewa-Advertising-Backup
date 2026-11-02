<?php

namespace Modules\PrintJob\Http\Requests\PrintJob;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePrintJobCostRequest extends FormRequest
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
            'discount' => ['required', 'numeric', 'min:0'],
            'print_cost_ids' => ['nullable', 'array'],
            'print_cost_ids.*' => ['integer', 'exists:print_cost,id'],
        ];
    }
}
