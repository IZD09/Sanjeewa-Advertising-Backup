<?php

namespace Modules\Supplier\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Modules\Supplier\Models\Supplier;

class SupplierService
{
    /**
     * Build the query for suppliers with search and filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Supplier>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = Supplier::query()->withCount('purchaseOrders');

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
        $allowedSorts = ['id', 'name', 'mobile', 'email'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderByDesc('id');
        }

        return $query;
    }

    /**
     * Retrieve all suppliers.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Supplier>
     */
    public function getAllSuppliers(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated suppliers.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getSuppliers(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find a supplier by ID with relations.
     */
    public function getSupplierById(int $id): ?Supplier
    {
        return Supplier::query()
            ->with(['purchaseOrders' => fn ($q) => $q->latest('id')->limit(10)])
            ->withCount('purchaseOrders')
            ->find($id);
    }

    /**
     * Create a new supplier.
     *
     * @param  array<string, mixed>  $data
     */
    public function createSupplier(array $data): Supplier
    {
        return Supplier::create([
            'name' => trim((string) ($data['name'] ?? '')),
            'mobile' => trim((string) ($data['mobile'] ?? '')),
            'email' => ! empty($data['email']) ? trim((string) $data['email']) : null,
        ]);
    }

    /**
     * Update an existing supplier.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateSupplier(Supplier $supplier, array $data): Supplier
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

        $supplier->update($attributes);

        return $supplier->fresh();
    }

    /**
     * Delete a supplier.
     */
    public function deleteSupplier(Supplier $supplier): bool
    {
        return (bool) $supplier->delete();
    }
}
