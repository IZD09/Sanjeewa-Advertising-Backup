<?php

namespace Modules\User\Http\Requests\UserPermission;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SyncUserPermissionsRequest extends FormRequest
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
            'permissions' => ['required', 'array'],
            'permissions.*.system_modules_id' => ['required', 'integer', 'exists:system_modules,id'],
            'permissions.*.view' => ['sometimes', 'boolean'],
            'permissions.*.create' => ['sometimes', 'boolean'],
            'permissions.*.edit' => ['sometimes', 'boolean'],
            'permissions.*.delete' => ['sometimes', 'boolean'],
            'permissions.*.export' => ['sometimes', 'boolean'],
        ];
    }
}
