<?php

namespace Modules\PrintJob\Http\Requests\PrintJob;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AssignStockItemRequest extends FormRequest
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
            'stock_id' => ['required_without:stock_items', 'nullable', 'integer', 'exists:stock,id'],
            'qty' => ['required_without:stock_items', 'nullable', 'integer', 'min:1'],
            'stock_items' => ['sometimes', 'array'],
            'stock_items.*.stock_id' => ['required_with:stock_items', 'integer', 'exists:stock,id'],
            'stock_items.*.qty' => ['required_with:stock_items', 'integer', 'min:1'],
        ];
    }
}
