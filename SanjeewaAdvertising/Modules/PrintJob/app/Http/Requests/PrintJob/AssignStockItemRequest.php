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
        $hasBatch = $this->has('stock_items');

        return [
            'stock_id' => [$hasBatch ? 'nullable' : 'required', 'nullable', 'integer', 'exists:stock,id'],
            'qty' => [$hasBatch ? 'nullable' : 'required', 'nullable', 'integer', 'min:1'],
            'stock_items' => ['sometimes', 'present', 'array'],
            'stock_items.*.stock_id' => ['required', 'integer', 'exists:stock,id'],
            'stock_items.*.qty' => ['required', 'integer', 'min:1'],
        ];
    }
}
