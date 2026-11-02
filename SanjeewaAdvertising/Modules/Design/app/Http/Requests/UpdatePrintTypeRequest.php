<?php

namespace Modules\Design\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePrintTypeRequest extends FormRequest
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
        $id = $this->route('print_type') ?? $this->route('id') ?? $this->input('id');

        return [
            'print_type' => [
                'required',
                'string',
                'max:45',
                Rule::unique('print_types', 'print_type')->ignore($id),
            ],
        ];
    }
}
