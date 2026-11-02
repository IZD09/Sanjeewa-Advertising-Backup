<?php

namespace Modules\Admin\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminRequest extends FormRequest
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
        $adminId = $this->route('admin') ?? $this->route('id') ?? $this->input('id');

        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:45'],
            'last_name' => ['sometimes', 'required', 'string', 'max:45'],
            'username' => [
                'sometimes',
                'required',
                'string',
                'max:45',
                Rule::unique('admins', 'username')->ignore($adminId),
            ],
            'password' => ['nullable', 'string', 'min:6', 'max:255'],
            'mobile' => [
                'sometimes',
                'required',
                'string',
                'max:15',
                Rule::unique('admins', 'mobile')->ignore($adminId),
            ],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:100',
                Rule::unique('admins', 'email')->ignore($adminId),
            ],
            'admin_statuses_id' => ['sometimes', 'required', 'integer', 'exists:admin_statuses,id'],
            'admin_types_id' => ['sometimes', 'required', 'integer', 'exists:admin_types,id'],
        ];
    }
}
