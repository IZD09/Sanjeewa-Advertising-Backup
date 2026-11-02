<?php

namespace Modules\PrintJob\Http\Requests\Status;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePrintJobStatusRequest extends FormRequest
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
        $statusId = $this->route('print_job_status') ?? $this->route('id') ?? $this->input('id');

        return [
            'print_job_states' => [
                'required',
                'string',
                'max:30',
                Rule::unique('print_job_statuses', 'print_job_states')->ignore($statusId),
            ],
        ];
    }
}
