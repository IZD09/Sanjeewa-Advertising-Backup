<?php

namespace Modules\User\Http\Requests\UserPermission;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AssignUserPermissionRequest extends FormRequest
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
            'system_modules_id' => ['required', 'integer', 'exists:system_modules,id'],
            'permision_stateses_id' => ['required', 'integer', 'exists:permision_stateses,id'],
        ];
    }
}
