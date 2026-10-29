<?php

namespace Modules\User\Http\Requests\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user') ?? $this->route('id') ?? $this->input('id');

        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:50'],
            'last_name' => ['sometimes', 'required', 'string', 'max:50'],
            'mobile' => [
                'sometimes',
                'required',
                'string',
                'max:15',
                Rule::unique('users', 'mobile')->ignore($userId),
            ],
            'username' => [
                'sometimes',
                'required',
                'string',
                'max:30',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'password' => ['nullable', 'string', 'min:6', 'max:255'],
            'user_statuses_id' => ['sometimes', 'required', 'integer', 'exists:user_statuses,id'],
        ];
    }
}
