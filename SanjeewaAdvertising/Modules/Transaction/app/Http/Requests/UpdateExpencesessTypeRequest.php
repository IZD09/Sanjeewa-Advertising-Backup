<?php

namespace Modules\Transaction\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExpencesessTypeRequest extends FormRequest
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
        $id = $this->route('id') ?? $this->route('expense_type');

        return [
            'expencesess_type' => [
                'required',
                'string',
                'max:50',
                Rule::unique('expencesess_types', 'expencesess_type')->ignore($id),
            ],
        ];
    }
}
