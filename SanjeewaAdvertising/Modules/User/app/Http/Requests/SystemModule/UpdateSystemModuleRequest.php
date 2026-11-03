<?php

namespace Modules\User\Http\Requests\SystemModule;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSystemModuleRequest extends FormRequest
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
        $moduleId = $this->route('system_module') ?? $this->route('id');

        return [
            'system_module' => [
                'required',
                'string',
                'max:50',
                Rule::unique('system_modules', 'system_module')->ignore($moduleId),
            ],
        ];
    }
}
