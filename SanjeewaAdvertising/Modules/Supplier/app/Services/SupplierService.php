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

    /**
     * Retrieve Suppliers demo data and summary counts for UI views.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getSuppliersData(array $filters = []): array
    {
        $suppliers = $this->resolveSuppliersDemoData($filters);

        return [
            'suppliers' => $suppliers,
            'total' => count($suppliers),
        ];
    }

    /**
     * Resolve demo suppliers dataset with search and category filtering.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    protected function resolveSuppliersDemoData(array $filters = []): array
    {
        $allSuppliers = [
            [
                'code' => 'SUP-001',
                'name' => 'PaperPro Lanka',
                'contact_person' => 'Dinesh Ranatunga',
                'phone' => '077 123 4567',
                'alt_phone' => '011 234 8899',
                'email' => 'sales@paperpro.lk',
                'category' => 'Paper & Boards',
                'payment_terms' => '30 Days Credit',
                'address' => 'No. 45, Baseline Road, Colombo 09',
                'tax_no' => 'VAT-882910-1',
                'bank_details' => 'Commercial Bank - 8820194820',
                'status' => 'Active',
                'created_at' => '2026-01-10',
            ],
            [
                'code' => 'SUP-002',
                'name' => 'Flora Tech International',
                'contact_person' => 'Rohan De Silva',
                'phone' => '071 889 2233',
                'alt_phone' => '011 445 1122',
                'email' => 'info@floratech.lk',
                'category' => 'Inks & Solvents',
                'payment_terms' => '14 Days Credit',
                'address' => 'No. 112, High Level Road, Maharagama',
                'tax_no' => 'VAT-119203-9',
                'bank_details' => 'Sampath Bank - 0019284729',
                'status' => 'Active',
                'created_at' => '2026-01-15',
            ],
            [
                'code' => 'SUP-003',
                'name' => 'MegaFlex Imports',
                'contact_person' => 'Mohamed Rilwan',
                'phone' => '076 554 9988',
                'alt_phone' => '011 556 7788',
                'email' => 'megaflex@sltnet.lk',
                'category' => 'Flex & Banners',
                'payment_terms' => 'Cash on Delivery',
                'address' => 'No. 88, Kandy Road, Kelaniya',
                'tax_no' => 'VAT-992019-3',
                'bank_details' => 'HNB - 1002938475',
                'status' => 'Active',
                'created_at' => '2026-02-01',
            ],
            [
                'code' => 'SUP-004',
                'name' => 'Avery Dennison Lanka',
                'contact_person' => 'Chaminda Bandara',
                'phone' => '077 334 1122',
                'alt_phone' => '011 889 0011',
                'email' => 'orders@averydennison.lk',
                'category' => 'Vinyl & Stickers',
                'payment_terms' => '30 Days Credit',
                'address' => 'Biyagama Export Processing Zone',
                'tax_no' => 'VAT-554192-8',
                'bank_details' => 'Standard Chartered - 019283746',
                'status' => 'Active',
                'created_at' => '2026-02-12',
            ],
            [
                'code' => 'SUP-005',
                'name' => 'Star Media Group',
                'contact_person' => 'Anura Kumara',
                'phone' => '071 223 9988',
                'alt_phone' => '011 776 5544',
                'email' => 'starmedia@gmail.com',
                'category' => 'Flex & Banners',
                'payment_terms' => '15 Days Credit',
                'address' => 'No. 15, Negombo Road, Wattala',
                'tax_no' => 'VAT-332910-4',
                'bank_details' => 'BOC - 7728192837',
                'status' => 'Active',
                'created_at' => '2026-02-20',
            ],
            [
                'code' => 'SUP-006',
                'name' => 'SignBoard Supplies',
                'contact_person' => 'Prasanna Jayakody',
                'phone' => '075 443 2211',
                'alt_phone' => '011 665 4433',
                'email' => 'signboard@sltnet.lk',
                'category' => 'Rigid Boards & Hardware',
                'payment_terms' => '30 Days Credit',
                'address' => 'No. 204, Galle Road, Dehiwala',
                'tax_no' => 'VAT-771829-0',
                'bank_details' => 'Commercial Bank - 1102938475',
                'status' => 'Active',
                'created_at' => '2026-03-01',
            ],
            [
                'code' => 'SUP-007',
                'name' => 'DisplayTech Hardware',
                'contact_person' => 'Suren Abeywickrama',
                'phone' => '077 998 7766',
                'alt_phone' => '011 998 8776',
                'email' => 'displaytech@slt.lk',
                'category' => 'Rollup Stands & Displays',
                'payment_terms' => 'Cash on Delivery',
                'address' => 'No. 67, Old Moor Street, Colombo 12',
                'tax_no' => 'VAT-449102-3',
                'bank_details' => 'Seylan Bank - 0029384716',
                'status' => 'Active',
                'created_at' => '2026-03-10',
            ],
            [
                'code' => 'SUP-008',
                'name' => 'PrintCare Materials',
                'contact_person' => 'Kavinda Wickramasinghe',
                'phone' => '071 445 6677',
                'alt_phone' => '011 334 5566',
                'email' => 'supply@printcare.lk',
                'category' => 'Paper & Boards',
                'payment_terms' => '30 Days Credit',
                'address' => 'No. 77, Awissawella Road, Wellampitiya',
                'tax_no' => 'VAT-662918-2',
                'bank_details' => 'Commercial Bank - 8819203948',
                'status' => 'Active',
                'created_at' => '2026-03-15',
            ],
        ];

        $searchTerm = strtolower(trim((string) ($filters['search'] ?? $filters['q'] ?? '')));
        $categoryFilter = (string) ($filters['category'] ?? 'ALL');

        return array_values(array_filter($allSuppliers, function ($sup) use ($searchTerm, $categoryFilter) {
            if ($categoryFilter !== 'ALL' && strcasecmp($sup['category'], $categoryFilter) !== 0) {
                return false;
            }

            if ($searchTerm !== '') {
                $searchable = strtolower($sup['code'].' '.$sup['name'].' '.$sup['contact_person'].' '.$sup['phone'].' '.$sup['address'].' '.$sup['category']);
                if (! str_contains($searchable, $searchTerm)) {
                    return false;
                }
            }

            return true;
        }));
    }
}
