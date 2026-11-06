<?php

namespace Modules\Customer\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Controllers\BaseApiController;
use Modules\Customer\Http\Requests\StoreCustomerRequest;
use Modules\Customer\Http\Requests\UpdateCustomerRequest;
use Modules\Customer\Services\CustomerService;
use Modules\Customer\Transformers\CustomerResource;
use Modules\PrintJob\Transformers\PrintJobResource;

class CustomerController extends BaseApiController
{
    public function __construct(
        protected CustomerService $customerService
    ) {
    }

    /**
     * Display a listing of customers with optional search and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $customers = $this->customerService->getAllCustomers($request->query());

            return $this->success(
                CustomerResource::collection($customers),
                'All customers retrieved successfully.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $customers = $this->customerService->getCustomers($request->query(), $perPage);

        $customers->through(fn ($customer) => new CustomerResource($customer));

        return $this->paginated($customers, 'Customers retrieved successfully.');
    }

    /**
     * Retrieve all customers matching criteria without pagination limit.
     */
    public function all(Request $request): JsonResponse
    {
        $customers = $this->customerService->getAllCustomers($request->query());

        return $this->success(
            CustomerResource::collection($customers),
            'All customers retrieved successfully.'
        );
    }

    /**
     * Search customers across name, mobile, and email.
     */
    public function search(Request $request): JsonResponse
    {
        if ($request->boolean('all') || $request->query('per_page') === 'all') {
            $customers = $this->customerService->getAllCustomers($request->query());

            return $this->success(
                CustomerResource::collection($customers),
                'Customers search results.'
            );
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $customers = $this->customerService->getCustomers($request->query(), $perPage);

        $customers->through(fn ($customer) => new CustomerResource($customer));

        return $this->paginated($customers, 'Customers search results.');
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = $this->customerService->createCustomer($request->validated());

        return $this->created(
            new CustomerResource($customer),
            'Customer created successfully.'
        );
    }

    /**
     * Display the specified customer.
     */
    public function show(int $id): JsonResponse
    {
        $customer = $this->customerService->getCustomerById($id);

        if (! $customer) {
            return $this->notFound('Customer not found.');
        }

        return $this->success(
            new CustomerResource($customer),
            'Customer details retrieved successfully.'
        );
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(UpdateCustomerRequest $request, int $id): JsonResponse
    {
        $customer = $this->customerService->getCustomerById($id);

        if (! $customer) {
            return $this->notFound('Customer not found.');
        }

        $updatedCustomer = $this->customerService->updateCustomer($customer, $request->validated());

        return $this->success(
            new CustomerResource($updatedCustomer),
            'Customer updated successfully.'
        );
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $customer = $this->customerService->getCustomerById($id);

        if (! $customer) {
            return $this->notFound('Customer not found.');
        }

        $this->customerService->deleteCustomer($customer);

        return $this->success(null, 'Customer deleted successfully.');
    }

    /**
     * Get print jobs for the specified customer.
     */
    public function printJobs(Request $request, int $id): JsonResponse
    {
        $customer = $this->customerService->getCustomerById($id);

        if (! $customer) {
            return $this->notFound('Customer not found.');
        }

        $perPage = max(1, min(100, (int) $request->query('per_page', 15)));
        $jobs = $customer->printJobs()->with(['printType', 'latestStatusHistory.status'])->paginate($perPage);

        $jobs->through(fn ($job) => new PrintJobResource($job));

        return $this->paginated($jobs, 'Customer print jobs retrieved successfully.');
    }
}
