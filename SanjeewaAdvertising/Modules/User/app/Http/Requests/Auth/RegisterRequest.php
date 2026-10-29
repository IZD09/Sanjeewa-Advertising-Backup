<?php

namespace Modules\User\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'mobile' => ['required', 'string', 'max:15', 'unique:users,mobile'],
            'username' => ['required', 'string', 'max:30', 'unique:users,username'],
            'password' => ['required', 'string', 'min:6', 'max:255', 'confirmed'],
            'user_statuses_id' => ['nullable', 'integer', 'exists:user_statuses,id'],
        ];
    }
}
