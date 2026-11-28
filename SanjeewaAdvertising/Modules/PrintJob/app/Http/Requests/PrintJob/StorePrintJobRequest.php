<?php

namespace Modules\PrintJob\Http\Requests\PrintJob;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePrintJobRequest extends FormRequest
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
        if ($this->has('orders')) {
            return [
                'customer_id' => ['required', 'integer', 'exists:customer,id'],
                'add_date' => ['nullable', 'date'],
                'payment_amount' => ['nullable', 'numeric', 'min:0'],
                'paid_amount' => ['nullable', 'numeric', 'min:0'],
                'payment_types_id' => ['nullable', 'integer', 'exists:payment_types,id'],
                'payment_statuses_id' => ['nullable', 'integer', 'exists:payment_statuses,id'],
                'orders' => ['required', 'array', 'min:1'],
                'orders.*.users_id' => ['nullable', 'integer', 'exists:users,id'],
                'orders.*.print_types_id' => ['required', 'integer', 'exists:print_types,id'],
                'orders.*.qty' => ['required', 'integer', 'min:1'],
                'orders.*.wtdth' => ['required', 'numeric', 'gt:0'],
                'orders.*.hight' => ['required', 'numeric', 'gt:0'],
                'orders.*.unit_id' => ['required', 'integer', 'exists:unit,id'],
                'orders.*.delivery_method_id' => ['required', 'integer', 'exists:delivery_method,id'],
                'orders.*.unit_price' => ['required', 'numeric', 'min:0'],
                'orders.*.discount' => ['nullable', 'numeric', 'min:0'],
                'orders.*.design_status' => ['nullable', 'string', 'max:100'],
                'orders.*.print_job_statuses_id' => ['nullable', 'integer', 'exists:print_job_statuses,id'],
                'orders.*.total_amount' => ['nullable', 'numeric', 'min:0'],
                'orders.*.delivery_date' => ['nullable', 'date'],
                'orders.*.deadline' => ['nullable', 'date'],
                'orders.*.discription' => ['nullable', 'string', 'max:255'],
                'orders.*.notes' => ['nullable', 'string', 'max:1000'],
                'orders.*.print_cost_ids' => ['nullable', 'array'],
                'orders.*.print_cost_ids.*' => ['integer', 'exists:print_cost,id'],
                'orders.*.stock_items' => ['nullable', 'array'],
                'orders.*.stock_items.*.stock_id' => ['required_with:orders.*.stock_items', 'integer', 'exists:stock,id'],
                'orders.*.stock_items.*.qty' => ['required_with:orders.*.stock_items', 'numeric', 'min:0.001'],
            ];
        }

        return [
            'users_id' => ['nullable', 'integer', 'exists:users,id'],
            'customer_id' => ['required', 'integer', 'exists:customer,id'],
            'print_types_id' => ['required', 'integer', 'exists:print_types,id'],
            'add_date' => ['nullable', 'date'],
            'qty' => ['required', 'integer', 'min:1'],
            'wtdth' => ['nullable', 'numeric', 'min:0'],
            'hight' => ['nullable', 'numeric', 'min:0'],
            'unit_id' => ['nullable', 'integer', 'exists:unit,id'],
            'delivery_method_id' => ['nullable', 'integer', 'exists:delivery_method,id'],
            'discription' => ['nullable', 'string', 'max:255'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'design_status' => ['nullable', 'string', 'max:100'],
            'print_job_statuses_id' => ['nullable', 'integer', 'exists:print_job_statuses,id'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'payment_amount' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_types_id' => ['nullable', 'integer', 'exists:payment_types,id'],
            'payment_statuses_id' => ['nullable', 'integer', 'exists:payment_statuses,id'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'delivery_date' => ['nullable', 'date'],
            'deadline' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'print_cost_ids' => ['nullable', 'array'],
            'print_cost_ids.*' => ['integer', 'exists:print_cost,id'],
            'stock_items' => ['nullable', 'array'],
            'stock_items.*.stock_id' => ['required_with:stock_items', 'integer', 'exists:stock,id'],
            'stock_items.*.qty' => ['required_with:stock_items', 'numeric', 'min:0.001'],
        ];
    }

    /**
     * Perform cross-field validation for multi-order batch submissions.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (! $this->has('orders') || ! is_array($this->input('orders'))) {
                    return;
                }

                $paidAmount = (float) ($this->input('payment_amount') ?? $this->input('paid_amount') ?? 0);
                if ($paidAmount > 0 && empty($this->input('payment_types_id'))) {
                    $validator->errors()->add(
                        'payment_types_id',
                        'Please select a payment method when recording an advance payment.'
                    );
                }

                foreach ($this->input('orders', []) as $index => $order) {
                    if (! is_array($order)) {
                        continue;
                    }

                    if (empty($order['delivery_date']) && empty($order['deadline'])) {
                        $validator->errors()->add(
                            "orders.{$index}.deadline",
                            'Order #'.($index + 1).' requires a completion deadline date.'
                        );
                    }
                }
            },
        ];
    }
}
