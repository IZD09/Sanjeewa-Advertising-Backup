<?php

namespace Modules\Customer\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Customer\Models\Customer;
use Modules\Customer\Transformers\CustomerResource;

class CustomerService
{
    /**
     * Build the query for customers with optional search and filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Customer>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = Customer::query()->withCount(['printJobs', 'invoices']);

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $sortBy = (string) ($filters['sort_by'] ?? 'id');
        $sortOrder = strtolower((string) ($filters['sort_order'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['id', 'name', 'mobile', 'email', 'register_at'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderByDesc('id');
        }

        return $query;
    }

    /**
     * Retrieve all customers matching search criteria without pagination limit.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Customer>
     */
    public function getAllCustomers(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve customer directory data with aggregated KPIs.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getCustomersData(array $filters = []): array
    {
        $customers = $this->getAllCustomers($filters);
        $totalCustomers = Customer::count();
        $totalOrders = DB::table('print_jobs')->count();

        return [
            'customers' => CustomerResource::collection($customers),
            'kpis' => [
                'totalCustomers' => $totalCustomers,
                'totalOrders' => $totalOrders,
            ],
        ];
    }

    /**
     * Retrieve a paginated list of customers based on filter criteria.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getCustomers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find a customer by ID with relations.
     */
    public function getCustomerById(int $id): ?Customer
    {
        return Customer::query()
            ->withCount(['printJobs', 'invoices'])
            ->with(['printJobs' => fn ($q) => $q->latest('id')->limit(10)])
            ->find($id);
    }

    /**
     * Create a new customer record.
     *
     * @param  array<string, mixed>  $data
     */
    public function createCustomer(array $data): Customer
    {
        return Customer::create([
            'name' => trim((string) ($data['name'] ?? '')),
            'mobile' => trim((string) ($data['mobile'] ?? '')),
            'email' => ! empty($data['email']) ? trim((string) $data['email']) : null,
            'register_at' => ! empty($data['register_at']) ? $data['register_at'] : now(),
        ]);
    }

    /**
     * Update an existing customer record.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateCustomer(Customer $customer, array $data): Customer
    {
        $attributes = [];

        if (isset($data['name'])) {
            $attributes['name'] = trim((string) $data['name']);
        }
        if (isset($data['mobile'])) {
            $attributes['mobile'] = trim((string) $data['mobile']);
        }
        if (array_key_exists('email', $data)) {
            $attributes['email'] = ! empty($data['email']) ? trim((string) $data['email']) : null;
        }
        if (isset($data['register_at'])) {
            $attributes['register_at'] = $data['register_at'];
        }

        $customer->update($attributes);

        return $customer->fresh();
    }

    /**
     * Delete a customer record.
     */
    public function deleteCustomer(Customer $customer): bool
    {
        return (bool) $customer->delete();
    }
}
