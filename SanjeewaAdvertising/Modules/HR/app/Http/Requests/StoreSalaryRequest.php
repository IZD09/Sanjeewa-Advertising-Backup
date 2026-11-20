<?php

namespace Modules\HR\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreSalaryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only authenticated administrators can set or update staff base salaries.
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
            'staff_id' => ['required', 'integer', 'exists:staff,id'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999.99'],
        ];
    }

    /**
     * Get custom validation messages for base salary updates.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'staff_id.required' => 'Please select a staff member.',
            'staff_id.exists' => 'The selected staff member does not exist.',
            'amount.required' => 'Monthly base salary amount is required.',
            'amount.numeric' => 'Monthly base salary must be a valid number.',
            'amount.gt' => 'Monthly base salary must be greater than zero.',
        ];
    }
}
