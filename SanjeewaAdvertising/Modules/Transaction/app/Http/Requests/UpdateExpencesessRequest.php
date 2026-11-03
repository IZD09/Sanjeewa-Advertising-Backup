<?php

namespace Modules\Transaction\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExpencesessRequest extends FormRequest
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
            'expencesess_types_id' => ['sometimes', 'required', 'integer', 'exists:expencesess_types,id'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'expencesess_statuses_id' => ['sometimes', 'required', 'integer', 'exists:expencesess_statuses,id'],
            'add_by' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'pay_by' => ['nullable', 'integer', 'exists:users,id'],
            'add_date' => ['sometimes', 'required', 'date'],
            'pay_at' => ['nullable', 'date'],
        ];
    }
}
