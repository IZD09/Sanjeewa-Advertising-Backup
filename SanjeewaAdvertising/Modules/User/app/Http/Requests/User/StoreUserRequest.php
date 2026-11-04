<?php

namespace Modules\User\Http\Requests\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Modules\User\Models\User;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only authenticated administrators can create new users.
     */
    public function authorize(): bool
    {
        // 1. Authenticated administrator via 'admin' guard
        if (Auth::guard('admin')->check()) {
            return (int) Auth::guard('admin')->user()->admin_statuses_id === 1;
        }

        // 2. Authenticated user via 'web' guard with admin privileges or User Control permission
        if (Auth::guard('web')->check()) {
            /** @var User $user */
            $user = Auth::guard('web')->user();

            return $user->username === 'admin' || $user->canAccessModule('User Control');
        }

        return false;
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
            'password' => ['required', 'string', 'min:6', 'max:255'],
            'user_statuses_id' => ['required', 'integer', 'exists:user_statuses,id'],
        ];
    }
}
