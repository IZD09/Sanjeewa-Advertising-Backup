<?php

namespace Modules\Core\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreActivityRequest extends FormRequest
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
            'activity_types_id' => ['required', 'integer', 'exists:activity_types,id'],
            'activity' => ['required'],
            'user_or_admin' => ['nullable', 'integer', 'in:1,2'],
            'users_id' => ['nullable', 'integer', 'exists:users,id'],
            'admins_id' => ['nullable', 'integer', 'exists:admins,id'],
            'activity_time' => ['nullable', 'date'],
        ];
    }
}
