<?php

namespace Modules\Supplier\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Modules\Core\Support\MobileNumberHelper;
use Modules\Supplier\Models\PurchaseOrderStatus;
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
        $query = Supplier::query()
            ->withCount([
                'purchaseOrders',
                'purchaseOrders as pending_purchase_orders_count' => function ($q) {
                    $q->whereIn('purchase_orders_status_id', [
                        PurchaseOrderStatus::STATUS_PENDING,
                        PurchaseOrderStatus::STATUS_PARTIAL,
                    ]);
                },
                'purchaseOrders as approved_purchase_orders_count' => function ($q) {
                    $q->where('purchase_orders_status_id', PurchaseOrderStatus::STATUS_APPROVED);
                },
            ]);

        $search = $filters['search'] ?? $filters['q'] ?? null;
        if (! empty($search)) {
            $search = trim((string) $search);
            $numericId = preg_replace('/\D+/', '', $search);
            $query->where(function (Builder $q) use ($search, $numericId) {
                if ($numericId !== '') {
                    $q->where('id', (int) $numericId);
                }
                $q->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
                MobileNumberHelper::orWhereMobileLike($q, 'mobile', $search);
            });
        }

        $status = $filters['status'] ?? null;
        if (! empty($status) && $status !== 'ALL') {
            $query->where('status', $status);
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
     * Retrieve all suppliers from database.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Supplier>
     */
    public function getAllSuppliers(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated suppliers from database.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getSuppliers(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));
        $page = isset($filters['page']) ? max(1, (int) $filters['page']) : null;

        return $this->buildQuery($filters)->paginate($perPage, ['*'], 'page', $page);
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
            'email' => ! empty($data['email']) ? trim((string) $data['email']) : '',
            'bank_account' => ! empty($data['bank_account']) ? trim((string) $data['bank_account']) : null,
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
            $attributes['name'] = trim((string) ($data['name']));
        }
        if (isset($data['mobile'])) {
            $attributes['mobile'] = trim((string) ($data['mobile']));
        }
        if (array_key_exists('email', $data)) {
            $attributes['email'] = ! empty($data['email']) ? trim((string) $data['email']) : '';
        }
        if (array_key_exists('bank_account', $data)) {
            $attributes['bank_account'] = ! empty($data['bank_account']) ? trim((string) $data['bank_account']) : null;
        }

        $supplier->update($attributes);

        return $supplier->fresh();
    }

    /**
     * Disable a supplier instead of permanent delete.
     */
    public function deleteSupplier(Supplier $supplier): bool
    {
        return $supplier->update(['status' => 'Disabled']);
    }

    /**
     * Toggle supplier active/disabled status.
     */
    public function toggleSupplierStatus(Supplier $supplier): Supplier
    {
        $newStatus = $supplier->status === 'Disabled' ? 'Active' : 'Disabled';
        $supplier->update(['status' => $newStatus]);

        return $supplier->fresh();
    }

    /**
     * Retrieve Suppliers database records, pagination, and summary counts for UI views.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getSuppliersData(array $filters = []): array
    {
        $perPage = isset($filters['per_page']) ? max(1, min(100, (int) $filters['per_page'])) : 20;
        $paginator = $this->getSuppliers($filters, $perPage);

        $supplierCollection = new Collection($paginator->items());
        $supplierCollection->load([
            'purchaseOrders.items',
            'purchaseOrders.grns.payments',
        ]);

        $suppliers = $supplierCollection
            ->map(fn (Supplier $supplier) => $this->formatSupplierRecord($supplier))
            ->values()
            ->all();

        return [
            'suppliers' => $suppliers,
            'total' => $paginator->total(),
            'pagination' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem() ?? 0,
                'to' => $paginator->lastItem() ?? 0,
            ],
        ];
    }

    /**
     * Calculate the total pending payable balance owed to a supplier across all non-cancelled POs.
     */
    public function calculatePendingPayable(Supplier $supplier): float
    {
        if (! $supplier->relationLoaded('purchaseOrders')) {
            return 0.0;
        }

        $totalPoAmount = 0.0;
        $countedPaymentIds = [];
        $totalPaidAmount = 0.0;

        foreach ($supplier->purchaseOrders as $po) {
            if ((int) $po->purchase_orders_status_id === PurchaseOrderStatus::STATUS_CANCELLED) {
                continue;
            }

            $totalPoAmount += (float) $po->items->sum(
                fn ($item) => (float) ($item->unit_cost ?? 0) * (float) ($item->qty_ordered ?? 0)
            );

            foreach ($po->grns as $grn) {
                foreach ($grn->payments ?? [] as $payment) {
                    $paymentId = (int) $payment->id;
                    if (! isset($countedPaymentIds[$paymentId])) {
                        $countedPaymentIds[$paymentId] = true;
                        $totalPaidAmount += (float) ($payment->payment ?? 0);
                    }
                }
            }
        }

        return round(max(0.0, $totalPoAmount - $totalPaidAmount), 2);
    }

    /**
     * Format a Supplier Eloquent model into the UI array representation.
     *
     * @return array<string, mixed>
     */
    public function formatSupplierRecord(Supplier $supplier): array
    {
        $code = 'SUP-'.str_pad((string) $supplier->id, 3, '0', STR_PAD_LEFT);
        $pendingPayable = $this->calculatePendingPayable($supplier);

        return [
            'id' => $supplier->id,
            'code' => $code,
            'name' => $supplier->name,
            'contact_person' => $supplier->name,
            'phone' => $supplier->mobile,
            'mobile' => $supplier->mobile,
            'alt_phone' => '',
            'email' => $supplier->email ?? '',
            'category' => 'General Printing Media',
            'payment_terms' => '30 Days Credit',
            'address' => '',
            'tax_no' => '',
            'bank_account' => $supplier->bank_account ?? '',
            'bank_details' => $supplier->bank_account ?? '',
            'status' => $supplier->status ?? 'Active',
            'purchase_orders_count' => (int) ($supplier->purchase_orders_count ?? 0),
            'pending_purchase_orders_count' => (int) ($supplier->pending_purchase_orders_count ?? 0),
            'approved_purchase_orders_count' => (int) ($supplier->approved_purchase_orders_count ?? 0),
            'pending_payable' => $pendingPayable,
        ];
    }
}
