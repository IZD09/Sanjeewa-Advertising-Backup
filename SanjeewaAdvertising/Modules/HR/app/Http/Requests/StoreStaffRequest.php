<?php

namespace Modules\HR\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreStaffRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Only authenticated administrators can register new staff members.
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
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'first_name' => is_string($this->first_name) ? trim($this->first_name) : $this->first_name,
            'last_name' => is_string($this->last_name) ? trim($this->last_name) : $this->last_name,
            'nic' => is_string($this->nic) ? strtoupper(trim($this->nic)) : $this->nic,
            'mobile' => is_string($this->mobile) ? trim($this->mobile) : $this->mobile,
        ]);
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
            'nic' => ['required', 'string', 'min:9', 'max:15', 'unique:staff,nic'],
            'mobile' => ['required', 'string', 'min:9', 'max:15', 'regex:/^[0-9+() -]{9,15}$/'],
        ];
    }

    /**
     * Get custom validation messages for staff registration.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'nic.required' => 'NIC number is required.',
            'nic.unique' => 'A staff member with this NIC number is already registered.',
            'mobile.required' => 'Mobile phone number is required.',
            'mobile.regex' => 'Please enter a valid mobile phone number.',
        ];
    }
}
