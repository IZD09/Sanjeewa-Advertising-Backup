<?php

namespace Modules\Transaction\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use Modules\PrintJob\Models\PrintJob;

class StorePaymentRequest extends FormRequest
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
            'payment' => ['required', 'numeric', 'min:0.01'],
            'print_jobs_id' => ['required', 'integer', 'exists:print_jobs,id'],
            'payment_types_id' => ['required', 'integer', 'exists:payment_types,id'],
            'payment_statuses_id' => ['required', 'integer', 'exists:payment_statuses,id'],
            'pay_date' => ['nullable', 'date'],
            'invoice_id' => ['nullable', 'integer', 'exists:invoice,id'],
        ];
    }

    /**
     * Custom validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'payment.required' => 'Payment amount is required.',
            'payment.numeric' => 'Payment amount must be a valid number.',
            'payment.min' => 'Payment amount must be at least Rs. 0.01.',
            'print_jobs_id.required' => 'The print job order ID is required.',
            'print_jobs_id.integer' => 'The print job order ID must be a valid integer.',
            'print_jobs_id.exists' => 'The selected print job order does not exist in the database.',
            'payment_types_id.required' => 'Please select a valid payment method.',
            'payment_types_id.integer' => 'Payment method ID must be a valid integer.',
            'payment_types_id.exists' => 'The selected payment method is invalid.',
            'payment_statuses_id.required' => 'Payment status is required.',
            'payment_statuses_id.integer' => 'Payment status ID must be a valid integer.',
            'payment_statuses_id.exists' => 'The selected payment status is invalid.',
            'pay_date.date' => 'The payment date and time must be a valid date.',
        ];
    }

    /**
     * Configure the validator instance with business domain checks.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $jobId = (int) $this->input('print_jobs_id');
            $paymentAmount = (float) $this->input('payment');

            if ($jobId > 0 && $paymentAmount > 0) {
                $job = PrintJob::query()
                    ->with(['cost.printCosts', 'payments', 'unit'])
                    ->find($jobId);

                if ($job) {
                    $costSum = (float) ($job->cost?->printCosts?->sum('price') ?? 0);
                    $unitPrice = $costSum > 0 ? $costSum : 120.00;
                    $qty = max(1, (int) $job->qty);
                    $width = (float) ($job->wtdth > 0 ? $job->wtdth : 10);
                    $height = (float) ($job->hight > 0 ? $job->hight : 4);
                    $unitSymbol = strtolower((string) ($job->unit?->simble ?? 'ft'));

                    $areaSqFt = match ($unitSymbol) {
                        'ft', 'feet' => $width * $height,
                        'in', 'inches' => ($width * $height) / 144,
                        'cm' => ($width * $height) / 929.0304,
                        'mm' => ($width * $height) / 92903.04,
                        'm' => ($width * $height) * 10.7639,
                        default => ($width * $height),
                    };

                    $subtotal = $unitSymbol === 'pcs'
                        ? ($unitPrice * $qty)
                        : ($areaSqFt * $unitPrice * $qty);

                    $discount = (float) ($job->cost?->discount ?? 0);
                    $totalAmount = max(0, $subtotal - $discount);
                    $alreadyPaid = (float) $job->payments->sum('payment');
                    $remainingBalance = max(0, $totalAmount - $alreadyPaid);

                    // 1. Check if print job payments are already completed across existing invoices
                    if ($totalAmount > 0 && $remainingBalance <= 0.00) {
                        $validator->errors()->add(
                            'payment',
                            sprintf(
                                'All payments for Print Job #%d have already been completed. No additional payments required.',
                                $jobId
                            )
                        );

                        return;
                    }

                    // 2. Check if payment amount exceeds the order's remaining balance
                    if ($totalAmount > 0 && $paymentAmount > ($remainingBalance + 0.05)) {
                        $validator->errors()->add(
                            'payment',
                            sprintf(
                                'Payment amount (Rs. %s) exceeds the outstanding remaining balance (Rs. %s) for Print Job #%d.',
                                number_format($paymentAmount, 2),
                                number_format($remainingBalance, 2),
                                $jobId
                            )
                        );
                    }
                }
            }
        });
    }
}
