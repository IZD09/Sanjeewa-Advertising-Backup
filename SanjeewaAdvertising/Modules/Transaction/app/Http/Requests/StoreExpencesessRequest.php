<?php

namespace Modules\Transaction\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreExpencesessRequest extends FormRequest
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
            'expencesess_types_id' => ['required', 'integer', 'exists:expencesess_types,id'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'expencesess_statuses_id' => ['required', 'integer', 'exists:expencesess_statuses,id'],
            'add_by' => ['nullable', 'integer', 'exists:users,id'],
            'pay_by' => ['nullable', 'integer', 'exists:users,id'],
            'add_date' => ['nullable', 'date'],
            'pay_at' => ['nullable', 'date'],
        ];
    }
}
