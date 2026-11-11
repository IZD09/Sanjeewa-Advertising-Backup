<?php

namespace Modules\User\Http\Requests\Profile;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::guard('web')->check() || Auth::guard('admin')->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = Auth::guard('web')->user() ?? Auth::guard('admin')->user();
        $userId = $user?->id;

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
            'current_password' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'max:255', 'confirmed'],
        ];
    }
}
