<?php

namespace Modules\Transaction\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreExpencesessTypeRequest extends FormRequest
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
            'expencesess_type' => ['required', 'string', 'max:50', 'unique:expencesess_types,expencesess_type'],
        ];
    }
}
