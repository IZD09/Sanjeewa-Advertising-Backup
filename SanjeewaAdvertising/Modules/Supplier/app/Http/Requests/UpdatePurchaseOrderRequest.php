<?php

namespace Modules\Supplier\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderRequest extends FormRequest
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
            'suppliers_id' => ['sometimes', 'required', 'integer', 'exists:suppliers,id'],
            'add_date' => ['sometimes', 'required', 'date'],
        ];
    }
}
