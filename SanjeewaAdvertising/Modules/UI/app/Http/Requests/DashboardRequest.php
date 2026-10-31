<?php

namespace Modules\UI\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DashboardRequest extends FormRequest
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
        return [
            'period' => ['sometimes', 'string', 'in:today,this_week,this_month,this_year,all'],
            'stream_interval' => ['sometimes', 'integer', 'min:5', 'max:300'],
            'refresh' => ['sometimes', 'boolean'],
            'once' => ['sometimes', 'boolean'],
        ];
    }
}
