<?php

namespace Modules\HR\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreDailySalaryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only authenticated administrators can record daily salary payments.
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
            'pay_at' => ['required', 'date'],
        ];
    }

    /**
     * Get custom validation messages for daily salary payment recording.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'staff_id.required' => 'Please select a staff member.',
            'staff_id.exists' => 'The selected staff member does not exist.',
            'amount.required' => 'Payment amount is required.',
            'amount.numeric' => 'Payment amount must be a valid number.',
            'amount.gt' => 'Payment amount must be greater than zero.',
            'pay_at.required' => 'Payment date and time is required.',
            'pay_at.date' => 'Please enter a valid payment date and time.',
        ];
    }
}
