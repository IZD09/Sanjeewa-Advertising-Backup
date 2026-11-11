<?php

namespace Modules\Transaction\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Transaction\Http\Requests\StoreGrnPaymentRequest;
use Modules\Transaction\Http\Requests\UpdateGrnPaymentRequest;
use Modules\Transaction\Services\TransactionService;
use Modules\Transaction\Transformers\GrnPaymentResource;

class GrnPaymentController extends BaseApiController
{
    public function __construct(
        protected TransactionService $transactionService
    ) {}

    /**
     * Display a listing of GRN payments with pagination or all.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $payments = $this->transactionService->getAllGrnPayments($request->query());

            return $this->success(
                GrnPaymentResource::collection($payments),
                'All GRN payments retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $payments = $this->transactionService->getGrnPayments($request->query(), $perPage);

        $payments->through(fn ($payment) => new GrnPaymentResource($payment));

        return $this->paginated($payments, 'GRN payments retrieved successfully.');
    }

    /**
     * Retrieve all GRN payments matching criteria without pagination limit.
     */
    public function all(Request $request): JsonResponse
    {
        $payments = $this->transactionService->getAllGrnPayments($request->query());

        return $this->success(
            GrnPaymentResource::collection($payments),
            'All GRN payments retrieved successfully.'
        );
    }

    /**
     * Retrieve live available purchase orders and GRN consignments for payment selection.
     */
    public function availablePurchaseOrders(Request $request): JsonResponse
    {
        $pos = $this->transactionService->getAvailablePurchaseOrders($request->all());

        return $this->success(
            $pos,
            'Available purchase orders and consignments retrieved successfully from database.'
        );
    }

    /**
     * Retrieve GRN payments data and KPIs for UI views.
     */
    public function grnPaymentsData(Request $request): JsonResponse
    {
        $data = $this->transactionService->getGrnPaymentsData($request->all());

        return $this->success(
            $data,
            'GRN payments data retrieved successfully.'
        );
    }

    /**
     * Store a newly created GRN payment in storage.
     */
    public function store(StoreGrnPaymentRequest $request): JsonResponse
    {
        $payment = $this->transactionService->createGrnPayment($request->validated());

        return $this->created(
            new GrnPaymentResource($payment),
            'GRN payment created successfully.'
        );
    }

    /**
     * Display the specified GRN payment.
     */
    public function show(int $id): JsonResponse
    {
        $payment = $this->transactionService->getGrnPaymentById($id);

        if (! $payment) {
            return $this->notFound('GRN payment not found.');
        }

        return $this->success(
            new GrnPaymentResource($payment),
            'GRN payment details retrieved successfully.'
        );
    }

    /**
     * Update the specified GRN payment in storage.
     */
    public function update(UpdateGrnPaymentRequest $request, int $id): JsonResponse
    {
        $payment = $this->transactionService->getGrnPaymentById($id);

        if (! $payment) {
            return $this->notFound('GRN payment not found.');
        }

        $updated = $this->transactionService->updateGrnPayment($payment, $request->validated());

        return $this->success(
            new GrnPaymentResource($updated),
            'GRN payment updated successfully.'
        );
    }

    /**
     * Remove the specified GRN payment from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $payment = $this->transactionService->getGrnPaymentById($id);

        if (! $payment) {
            return $this->notFound('GRN payment not found.');
        }

        $this->transactionService->deleteGrnPayment($payment);

        return $this->success(null, 'GRN payment deleted successfully.');
    }
}
