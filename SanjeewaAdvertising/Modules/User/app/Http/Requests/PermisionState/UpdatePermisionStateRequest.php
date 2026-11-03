<?php

namespace Modules\User\Http\Requests\PermisionState;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePermisionStateRequest extends FormRequest
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
        $stateId = $this->route('permision_state') ?? $this->route('id');

        return [
            'permision_states' => [
                'required',
                'string',
                'max:30',
                Rule::unique('permision_stateses', 'permision_states')->ignore($stateId),
            ],
        ];
    }
}
