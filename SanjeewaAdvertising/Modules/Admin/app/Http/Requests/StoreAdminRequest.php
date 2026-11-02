<?php

namespace Modules\Admin\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAdminRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:45'],
            'last_name' => ['required', 'string', 'max:45'],
            'username' => ['required', 'string', 'max:45', 'unique:admins,username'],
            'password' => ['required', 'string', 'min:6', 'max:255'],
            'mobile' => ['required', 'string', 'max:15', 'unique:admins,mobile'],
            'email' => ['required', 'email', 'max:100', 'unique:admins,email'],
            'admin_statuses_id' => ['required', 'integer', 'exists:admin_statuses,id'],
            'admin_types_id' => ['required', 'integer', 'exists:admin_types,id'],
        ];
    }
}
