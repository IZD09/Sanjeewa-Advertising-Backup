<?php

namespace Modules\Admin\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Modules\Admin\Models\AdminStatus;
use Modules\Admin\Models\AdminType;

class StoreAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (Auth::guard('admin')->check()) {
            return (int) (Auth::guard('admin')->user()->admin_statuses_id ?? 1) === 1;
        }

        if (Auth::guard('web')->check()) {
            $user = Auth::guard('web')->user();

            return $user->username === 'admin' || (method_exists($user, 'canAccessModule') && $user->canAccessModule('User Control', 'create'));
        }

        if ($this->is('admin/*') || $this->is('api/v1/admin/*')) {
            return false;
        }

        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('admin_types_id') && $this->filled('type')) {
            $typeVal = $this->input('type');
            if (is_numeric($typeVal)) {
                $this->merge(['admin_types_id' => (int) $typeVal]);
            } else {
                $type = AdminType::where('admin_type', trim((string) $typeVal))->first();
                if ($type) {
                    $this->merge(['admin_types_id' => $type->id]);
                }
            }
        } elseif ($this->filled('admin_types_id') && ! is_numeric($this->input('admin_types_id'))) {
            $type = AdminType::where('admin_type', trim((string) $this->input('admin_types_id')))->first();
            if ($type) {
                $this->merge(['admin_types_id' => $type->id]);
            }
        }

        if (! $this->filled('admin_statuses_id') && $this->filled('status')) {
            $statusVal = $this->input('status');
            if (is_numeric($statusVal)) {
                $this->merge(['admin_statuses_id' => (int) $statusVal]);
            } else {
                $status = AdminStatus::where('admin_statas', trim((string) $statusVal))->first();
                if ($status) {
                    $this->merge(['admin_statuses_id' => $status->id]);
                }
            }
        } elseif ($this->filled('admin_statuses_id') && ! is_numeric($this->input('admin_statuses_id'))) {
            $status = AdminStatus::where('admin_statas', trim((string) $this->input('admin_statuses_id')))->first();
            if ($status) {
                $this->merge(['admin_statuses_id' => $status->id]);
            }
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'username' => ['required', 'string', 'max:30', 'unique:admins,username'],
            'password' => ['required', 'string', 'min:6', 'max:255'],
            'mobile' => ['required', 'string', 'max:15', 'unique:admins,mobile'],
            'email' => ['required', 'email', 'max:100', 'unique:admins,email'],
            'admin_statuses_id' => ['required', 'integer', 'exists:admin_statuses,id'],
            'admin_types_id' => ['required', 'integer', 'exists:admin_types,id'],
        ];
    }
}
