<?php

namespace Modules\Transaction\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExpencesessStatusRequest extends FormRequest
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
        $id = $this->route('id') ?? $this->route('expense_status');

        return [
            'expencesess_status' => [
                'required',
                'string',
                'max:30',
                Rule::unique('expencesess_statuses', 'expencesess_status')->ignore($id),
            ],
        ];
    }
}
