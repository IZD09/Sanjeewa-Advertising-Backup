<?php

namespace Modules\PrintJob\Http\Requests\PrintJob;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePrintJobRequest extends FormRequest
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
            'users_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'customer_id' => ['sometimes', 'required', 'integer', 'exists:customer,id'],
            'print_types_id' => ['sometimes', 'required', 'integer', 'exists:print_types,id'],
            'add_date' => ['sometimes', 'required', 'date'],
            'qty' => ['sometimes', 'required', 'integer', 'min:1'],
            'wtdth' => ['sometimes', 'required', 'integer', 'min:0'],
            'hight' => ['sometimes', 'required', 'integer', 'min:0'],
            'unit_id' => ['sometimes', 'required', 'integer', 'exists:unit,id'],
            'delivery_method_id' => ['sometimes', 'required', 'integer', 'exists:delivery_method,id'],
            'payment_statuses_id' => ['nullable', 'integer', 'exists:payment_statuses,id'],
        ];
    }
}
