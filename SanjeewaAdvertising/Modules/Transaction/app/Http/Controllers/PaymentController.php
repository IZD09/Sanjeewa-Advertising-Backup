<?php

namespace Modules\Transaction\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Transaction\Http\Requests\StorePaymentRequest;
use Modules\Transaction\Http\Requests\UpdatePaymentRequest;
use Modules\Transaction\Services\TransactionService;
use Modules\Transaction\Transformers\PaymentResource;
use Modules\Transaction\Transformers\PaymentStatusResource;
use Modules\Transaction\Transformers\PaymentTypeResource;

class PaymentController extends BaseApiController
{
    public function __construct(
        protected TransactionService $transactionService
    ) {}

    /**
     * Display a listing of customer payments with pagination or all.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $payments = $this->transactionService->getAllPayments($request->query());

            return $this->success(
                PaymentResource::collection($payments),
                'All payments retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $payments = $this->transactionService->getPayments($request->query(), $perPage);

        $payments->through(fn ($payment) => new PaymentResource($payment));

        return $this->paginated($payments, 'Payments retrieved successfully.');
    }

    /**
     * Retrieve all customer payments matching criteria without pagination limit.
     */
    public function all(Request $request): JsonResponse
    {
        $payments = $this->transactionService->getAllPayments($request->query());

        return $this->success(
            PaymentResource::collection($payments),
            'All payments retrieved successfully.'
        );
    }

    /**
     * Retrieve Operating Expenses data and KPIs for UI views.
     */
    public function expensesData(Request $request): JsonResponse
    {
        $data = $this->transactionService->getOperatingExpensesData($request->all());

        return $this->success(
            $data,
            'Operating expenses data retrieved successfully.'
        );
    }

    /**
     * Store a newly created customer payment in storage.
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $payment = $this->transactionService->createPayment($request->validated());

        return $this->created(
            new PaymentResource($payment),
            'Payment created successfully.'
        );
    }

    /**
     * Display the specified customer payment.
     */
    public function show(int $id): JsonResponse
    {
        $payment = $this->transactionService->getPaymentById($id);

        if (! $payment) {
            return $this->notFound('Payment not found.');
        }

        return $this->success(
            new PaymentResource($payment),
            'Payment details retrieved successfully.'
        );
    }

    /**
     * Update the specified customer payment in storage.
     */
    public function update(UpdatePaymentRequest $request, int $id): JsonResponse
    {
        $payment = $this->transactionService->getPaymentById($id);

        if (! $payment) {
            return $this->notFound('Payment not found.');
        }

        $updated = $this->transactionService->updatePayment($payment, $request->validated());

        return $this->success(
            new PaymentResource($updated),
            'Payment updated successfully.'
        );
    }

    /**
     * Remove the specified customer payment from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $payment = $this->transactionService->getPaymentById($id);

        if (! $payment) {
            return $this->notFound('Payment not found.');
        }

        $this->transactionService->deletePayment($payment);

        return $this->success(null, 'Payment deleted successfully.');
    }

    /**
     * Retrieve all available payment types.
     */
    public function types(): JsonResponse
    {
        $types = $this->transactionService->getAllPaymentTypes();

        return $this->success(
            PaymentTypeResource::collection($types),
            'Payment types retrieved successfully.'
        );
    }

    /**
     * Retrieve all available payment statuses.
     */
    public function statuses(): JsonResponse
    {
        $statuses = $this->transactionService->getAllPaymentStatuses();

        return $this->success(
            PaymentStatusResource::collection($statuses),
            'Payment statuses retrieved successfully.'
        );
    }
}
