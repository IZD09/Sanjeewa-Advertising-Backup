<?php

namespace Modules\PrintJob\Http\Requests\PrintJob;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePrintJobRequest extends FormRequest
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
            'users_id' => ['nullable', 'integer', 'exists:users,id'],
            'customer_id' => ['required', 'integer', 'exists:customer,id'],
            'print_types_id' => ['required', 'integer', 'exists:print_types,id'],
            'add_date' => ['nullable', 'date'],
            'qty' => ['required', 'integer', 'min:1'],
            'print_job_statuses_id' => ['nullable', 'integer', 'exists:print_job_statuses,id'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'print_cost_ids' => ['nullable', 'array'],
            'print_cost_ids.*' => ['integer', 'exists:print_cost,id'],
            'stock_items' => ['nullable', 'array'],
            'stock_items.*.stock_id' => ['required_with:stock_items', 'integer', 'exists:stock,id'],
            'stock_items.*.qty' => ['required_with:stock_items', 'integer', 'min:1'],
        ];
    }
}
