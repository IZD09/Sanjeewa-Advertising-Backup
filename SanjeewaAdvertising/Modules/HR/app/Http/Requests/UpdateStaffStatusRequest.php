<?php

namespace Modules\HR\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateStaffStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only authenticated administrators can change a staff member's employment status.
     */
    public function authorize(): bool
    {
        if (Auth::guard('admin')->check()) {
            return (int) (Auth::guard('admin')->user()->admin_statuses_id ?? 1) === 1;
        }

        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();

            return $user->username === 'admin'
                || (method_exists($user, 'canAccessModule') && $user->canAccessModule('User Control'));
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
            'staff_statuses_id' => ['required', 'integer', 'exists:staff_statuses,id'],
        ];
    }

    /**
     * Get custom validation messages for staff status updates.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'staff_statuses_id.required' => 'Please select an employment status.',
            'staff_statuses_id.exists' => 'The selected employment status is invalid.',
        ];
    }
}
