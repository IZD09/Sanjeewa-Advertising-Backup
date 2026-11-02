<?php

namespace Modules\Supplier\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Inventory\Models\Stock;
use Modules\Supplier\Models\Grn;

class GrnService
{
    /**
     * Build the query for GRNs.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<Grn>
     */
    public function buildQuery(array $filters = []): Builder
    {
        $query = Grn::query()->with(['purchaseOrders.supplier', 'stocks.stockItem'])->withCount('stocks');

        if (! empty($filters['from_date'])) {
            $query->whereDate('at_time', '>=', $filters['from_date']);
        }

        if (! empty($filters['to_date'])) {
            $query->whereDate('at_time', '<=', $filters['to_date']);
        }

        return $query->orderByDesc('id');
    }

    /**
     * Retrieve all GRNs.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Grn>
     */
    public function getAllGrns(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Retrieve paginated GRNs.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getGrns(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $perPage = max(1, min(100, $perPage));

        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find a GRN by ID with relations.
     */
    public function getGrnById(int $id): ?Grn
    {
        return Grn::query()
            ->with(['purchaseOrders.supplier', 'stocks.stockItem', 'payments'])
            ->withCount('stocks')
            ->find($id);
    }

    /**
     * Create a new GRN with optional purchase order link and stock items.
     *
     * @param  array<string, mixed>  $data
     */
    public function createGrn(array $data): Grn
    {
        return DB::transaction(function () use ($data) {
            $grn = Grn::create([
                'at_time' => ! empty($data['at_time']) ? $data['at_time'] : now(),
            ]);

            if (! empty($data['purchase_orders_id'])) {
                $grn->purchaseOrders()->attach((int) $data['purchase_orders_id'], [
                    'supplyer_invoice' => $data['supplyer_invoice'] ?? null,
                ]);
            }

            if (! empty($data['stocks']) && is_array($data['stocks'])) {
                foreach ($data['stocks'] as $stockItem) {
                    Stock::create([
                        'stock_items_id' => (int) $stockItem['stock_items_id'],
                        'brands_id' => (int) $stockItem['brands_id'],
                        'qty' => (int) $stockItem['qty'],
                        'price' => (float) $stockItem['price'],
                        'buy' => (float) $stockItem['buy'],
                        'add_date' => now(),
                        'grn_id' => $grn->id,
                    ]);
                }
            }

            return $this->getGrnById($grn->id) ?? $grn;
        });
    }

    /**
     * Delete a GRN.
     */
    public function deleteGrn(Grn $grn): bool
    {
        return DB::transaction(function () use ($grn) {
            $grn->purchaseOrders()->detach();

            return (bool) $grn->delete();
        });
    }

    /**
     * Retrieve Goods Received Notes (GRN) demo data and KPIs for UI views.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getGrnData(array $filters = []): array
    {
        $grns = $this->resolveGrnDemoData($filters);
        $kpis = $this->resolveGrnKpis($grns);

        return [
            'grns' => $grns,
            'records' => $grns,
            'kpis' => $kpis,
        ];
    }

    /**
     * Resolve demo GRN records with optional search, status, and supplier filtering.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    protected function resolveGrnDemoData(array $filters = []): array
    {
        $today = now();

        $allGrns = [
            [
                'grn_id' => 'GRN-2610-001',
                'grn_number' => 'GRN-2610-001',
                'purchase_order_no' => 'PO-2026-088',
                'supplier_id' => 'SUP-001',
                'supplier_name' => 'PaperPro Lanka',
                'supplier_contact' => '077 123 4567',
                'supplier_invoice_no' => 'INV-PP-8821',
                'received_date' => $today->copy()->subDays(2)->toDateString(),
                'sub_total' => 97000.00,
                'discount' => 9500.00,
                'net_total' => 87500.00,
                'received_by' => 'Admin User',
                'status' => 'Completed',
                'created_at' => $today->copy()->subDays(2)->toDateTimeString(),
                'remarks' => 'Consignment delivery via lorry WP-DA-5520. All paper packs inspected and verified without water damage.',
                'items' => [
                    [
                        'item_id' => 'PAP-001',
                        'item_name' => '300gsm Art Board SRA3',
                        'unit' => 'Sheets',
                        'qty_received' => 1500,
                        'unit_cost' => 42.00,
                        'item_total' => 63000.00,
                        'batch_id' => 'BAT-101',
                    ],
                    [
                        'item_id' => 'PAP-003',
                        'item_name' => '150gsm Glossy Art Paper A4',
                        'unit' => 'Sheets',
                        'qty_received' => 2000,
                        'unit_cost' => 17.00,
                        'item_total' => 34000.00,
                        'batch_id' => 'BAT-102',
                    ],
                ],
            ],
            [
                'grn_id' => 'GRN-2610-002',
                'grn_number' => 'GRN-2610-002',
                'purchase_order_no' => 'PO-2026-092',
                'supplier_id' => 'SUP-002',
                'supplier_name' => 'Flora Tech International',
                'supplier_contact' => '071 889 2233',
                'supplier_invoice_no' => 'FTI-2026-441',
                'received_date' => $today->copy()->subDays(5)->toDateString(),
                'sub_total' => 68000.00,
                'discount' => 4000.00,
                'net_total' => 64000.00,
                'received_by' => 'Nuwan Silva',
                'status' => 'Completed',
                'created_at' => $today->copy()->subDays(5)->toDateTimeString(),
                'remarks' => 'Flora solvent inks delivered. Batch expiry verified up to 2028.',
                'items' => [
                    [
                        'item_id' => 'INK-101',
                        'item_name' => 'Flora Solvent Cyan Ink (5L)',
                        'unit' => 'Liters',
                        'qty_received' => 4,
                        'unit_cost' => 8500.00,
                        'item_total' => 34000.00,
                        'batch_id' => 'BAT-201',
                    ],
                    [
                        'item_id' => 'INK-102',
                        'item_name' => 'Flora Solvent Magenta Ink (5L)',
                        'unit' => 'Liters',
                        'qty_received' => 4,
                        'unit_cost' => 8500.00,
                        'item_total' => 34000.00,
                        'batch_id' => 'BAT-202',
                    ],
                ],
            ],
            [
                'grn_id' => 'GRN-2610-003',
                'grn_number' => 'GRN-2610-003',
                'purchase_order_no' => 'PO-2026-092',
                'supplier_id' => 'SUP-003',
                'supplier_name' => 'MegaFlex Imports',
                'supplier_contact' => '076 554 9988',
                'supplier_invoice_no' => 'MF-7729',
                'received_date' => $today->copy()->subDays(8)->toDateString(),
                'sub_total' => 46000.00,
                'discount' => 2000.00,
                'net_total' => 44000.00,
                'received_by' => 'Admin User',
                'status' => 'Completed',
                'created_at' => $today->copy()->subDays(8)->toDateTimeString(),
                'remarks' => 'Banner rolls inspected on warehouse arrival.',
                'items' => [
                    [
                        'item_id' => 'FLX-201',
                        'item_name' => 'Star Flex Heavy Banner 380gsm (10ft × 50m)',
                        'unit' => 'Rolls',
                        'qty_received' => 2,
                        'unit_cost' => 22000.00,
                        'item_total' => 44000.00,
                        'batch_id' => 'BAT-301',
                    ],
                ],
            ],
            [
                'grn_id' => 'GRN-2610-004',
                'grn_number' => 'GRN-2610-004',
                'purchase_order_no' => 'PO-2026-095',
                'supplier_id' => 'SUP-004',
                'supplier_name' => 'Avery Dennison Lanka',
                'supplier_contact' => '077 334 1122',
                'supplier_invoice_no' => 'AD-99102',
                'received_date' => $today->copy()->subDays(12)->toDateString(),
                'sub_total' => 100800.00,
                'discount' => 4800.00,
                'net_total' => 96000.00,
                'received_by' => 'Nuwan Silva',
                'status' => 'Completed',
                'created_at' => $today->copy()->subDays(12)->toDateTimeString(),
                'remarks' => 'Self-adhesive vinyl rolls in protective cartons.',
                'items' => [
                    [
                        'item_id' => 'VIN-301',
                        'item_name' => 'Glossy Self-Adhesive Vinyl (4ft × 50m)',
                        'unit' => 'Rolls',
                        'qty_received' => 6,
                        'unit_cost' => 16800.00,
                        'item_total' => 100800.00,
                        'batch_id' => 'BAT-401',
                    ],
                ],
            ],
            [
                'grn_id' => 'GRN-2610-005',
                'grn_number' => 'GRN-2610-005',
                'purchase_order_no' => 'PO-2026-068',
                'supplier_id' => 'SUP-006',
                'supplier_name' => 'SignBoard Supplies',
                'supplier_contact' => '075 443 2211',
                'supplier_invoice_no' => 'SB-3310',
                'received_date' => $today->copy()->subDays(1)->toDateString(),
                'sub_total' => 44200.00,
                'discount' => 2200.00,
                'net_total' => 42000.00,
                'received_by' => 'Chamara Bandara',
                'status' => 'Draft',
                'created_at' => $today->copy()->subDays(1)->toDateTimeString(),
                'remarks' => '5mm foam boards received in good shape. Pending final barcode tags.',
                'items' => [
                    [
                        'item_id' => 'RIG-401',
                        'item_name' => '5mm White Foam Board (4ft × 8ft)',
                        'unit' => 'Sheets',
                        'qty_received' => 13,
                        'unit_cost' => 3400.00,
                        'item_total' => 44200.00,
                        'batch_id' => 'BAT-501',
                    ],
                ],
            ],
        ];

        $searchTerm = strtolower(trim((string) ($filters['search'] ?? $filters['q'] ?? '')));
        $statusFilter = (string) ($filters['status'] ?? 'ALL');
        $supplierFilter = (string) ($filters['supplier'] ?? 'ALL');

        return array_values(array_filter($allGrns, function ($grn) use ($searchTerm, $statusFilter, $supplierFilter) {
            if ($statusFilter !== 'ALL' && strcasecmp($grn['status'], $statusFilter) !== 0) {
                return false;
            }

            if ($supplierFilter !== 'ALL' && strcasecmp($grn['supplier_name'], $supplierFilter) !== 0) {
                return false;
            }

            if ($searchTerm !== '') {
                $searchable = strtolower(
                    $grn['grn_number'].' '.$grn['purchase_order_no'].' '.$grn['supplier_name'].' '.$grn['supplier_contact']
                );
                if (! str_contains($searchable, $searchTerm)) {
                    return false;
                }
            }

            return true;
        }));
    }

    /**
     * Calculate summary metrics / KPIs for GRNs.
     *
     * @param  array<int, array<string, mixed>>  $grns
     * @return array<string, mixed>
     */
    protected function resolveGrnKpis(array $grns): array
    {
        $totalCount = count($grns);
        $completedCount = 0;
        $draftCount = 0;
        $totalValue = 0.0;

        foreach ($grns as $rec) {
            if (($rec['status'] ?? '') === 'Completed') {
                $completedCount++;
                $totalValue += (float) ($rec['net_total'] ?? 0);
            } else {
                $draftCount++;
            }
        }

        return [
            'total' => $totalCount,
            'completed' => $completedCount,
            'draft' => $draftCount,
            'total_value' => $totalValue,
        ];
    }
}
