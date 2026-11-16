<?php

namespace Modules\Transaction\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Supplier\Transformers\GrnResource;
use Modules\Transaction\Models\GrnPayment;

/**
 * @mixin GrnPayment
 */
class GrnPaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $grn = $this->grn;
        $stockTotal = 0.0;
        if ($grn && $grn->relationLoaded('stocks')) {
            $stockTotal = (float) $grn->stocks->sum(fn ($s) => (float) ($s->qty * ($s->buy ?? $s->price ?? 0)));
        }

        $paid = (float) ($this->payment ?? 0);
        $netTotal = $stockTotal > 0 ? $stockTotal : (float) ($this->net_total ?? $paid);
        $bal = max(0.0, $netTotal - $paid);

        $stage = ($bal <= 0.0 && $paid > 0.0)
            ? 'Complete Payment'
            : ($paid > 0.0 && $bal > 0.0 ? 'Advance Payment' : 'Pending Payment');

        $status = ($bal <= 0.0 && $paid > 0.0)
            ? 'Paid'
            : ($paid > 0.0 && $bal > 0.0 ? 'Partial' : 'Pending');

        $methodName = $this->paymentType?->payment_type ?? ($this->method ?? 'Bank Transfer');
        $grnNum = 'GRN-2026-'.str_pad((string) ($this->grn_id ?? $this->id), 3, '0', STR_PAD_LEFT);

        $poList = [];
        $posDetails = [];
        $supplierName = 'PaperPro Lanka (Pvt) Ltd';
        $supplierBankAccount = '';
        $supplierId = null;

        if ($grn && $grn->relationLoaded('purchaseOrders')) {
            foreach ($grn->purchaseOrders as $po) {
                $formattedPoNum = 'PO-2026-'.str_pad((string) $po->id, 3, '0', STR_PAD_LEFT);
                $poList[] = $formattedPoNum;

                if ($po->supplier) {
                    $supplierName = $po->supplier->name ?? $supplierName;
                    $supplierBankAccount = $po->supplier->bank_account ?? $supplierBankAccount;
                    $supplierId = $po->supplier->id ?? $supplierId;
                }

                $poItems = [];
                $poItemsTotal = 0.0;
                if ($po->relationLoaded('items')) {
                    foreach ($po->items as $item) {
                        $qtyOrdered = (int) ($item->qty_ordered ?? 0);
                        $unitCost = (float) ($item->unit_cost ?? 0);
                        $lineTotal = $qtyOrdered * $unitCost;
                        $poItemsTotal += $lineTotal;

                        $poItems[] = [
                            'name' => $item->stockItem?->name ?? 'Material Item',
                            'code' => $item->stockItem?->code ?? '',
                            'qty_ordered' => $qtyOrdered,
                            'qty_received' => (int) ($item->qty_received ?? 0),
                            'unit_cost' => $unitCost,
                            'line_total' => $lineTotal,
                        ];
                    }
                }

                $posDetails[] = [
                    'id' => $formattedPoNum,
                    'raw_id' => $po->id,
                    'poNumber' => $formattedPoNum,
                    'orderDate' => $po->add_date?->format('Y-m-d') ?? null,
                    'status' => $po->status?->purchase_orders_status ?? 'Pending',
                    'notes' => $po->notes ?? '',
                    'supplierName' => $po->supplier?->name ?? $supplierName,
                    'supplierBankAccount' => $po->supplier?->bank_account ?? '',
                    'supplierInvoice' => $po->pivot?->supplyer_invoice ?? '',
                    'stockCategory' => $poItems[0]['name'] ?? 'Stock Delivery',
                    'total' => $poItemsTotal > 0 ? $poItemsTotal : $netTotal,
                    'allocatedNow' => count($grn->purchaseOrders) === 1 ? $paid : 0.0,
                    'balanceRemaining' => count($grn->purchaseOrders) === 1 ? $bal : 0.0,
                    'items' => $poItems,
                ];
            }
        }

        if ($netTotal <= 0 && count($posDetails) > 0) {
            $netTotal = (float) collect($posDetails)->sum('total');
            $bal = max(0.0, $netTotal - $paid);
        }

        $poNum = count($poList) > 0 ? implode(', ', $poList) : ('PO-2026-'.str_pad((string) ($this->grn_id ?? '101'), 3, '0', STR_PAD_LEFT));

        $grnItems = [];
        if ($grn && $grn->relationLoaded('stocks')) {
            foreach ($grn->stocks as $stock) {
                $qty = (int) ($stock->qty ?? 0);
                $price = (float) ($stock->buy ?? $stock->price ?? 0);
                $grnItems[] = [
                    'name' => $stock->stockItem?->name ?? 'Stock Material',
                    'code' => $stock->stockItem?->code ?? '',
                    'qty_ordered' => $qty,
                    'qty_received' => $qty,
                    'unit_cost' => $price,
                    'line_total' => $qty * $price,
                ];
            }
        }

        $stockCategory = 'Stock Delivery & Consignment';
        if ($grn && $grn->relationLoaded('stocks') && $grn->stocks->first()?->stockItem?->name) {
            $stockCategory = $grn->stocks->first()->stockItem->name.' (+'.count($grn->stocks).' materials)';
        } elseif (! empty($posDetails[0]['items'][0]['name'])) {
            $firstItemName = $posDetails[0]['items'][0]['name'];
            $itemCount = count($posDetails[0]['items']);
            $stockCategory = $itemCount > 1 ? "{$firstItemName} (+".($itemCount - 1).' more)' : $firstItemName;
        }

        return [
            'id' => $this->id,
            'payment' => $paid,
            'amount' => $paid,
            'paid_amount' => $paid,
            'paidAmount' => $paid,
            'grn_id' => $this->grn_id,
            'grnId' => $this->grn_id,
            'grn_number' => $grnNum,
            'grnNumber' => $grnNum,
            'po_number' => $poNum,
            'poNumber' => $poNum,
            'po_numbers' => $poList,
            'poNumbers' => $poList,
            'po_count' => max(1, count($poList)),
            'poCount' => max(1, count($poList)),
            'pos' => $posDetails,
            'grn_items' => $grnItems,
            'supplier_id' => $supplierId ? ('SUP-'.str_pad((string) $supplierId, 3, '0', STR_PAD_LEFT)) : 'SUP-001',
            'supplier_name' => $supplierName,
            'supplierName' => $supplierName,
            'supplier_bank_account' => $supplierBankAccount,
            'supplierBankAccount' => $supplierBankAccount,
            'stock_category' => $stockCategory,
            'stockCategory' => $stockCategory,
            'net_total' => $netTotal,
            'totalBill' => $netTotal,
            'balance' => $bal,
            'balance_amount' => $bal,
            'balanceAmount' => $bal,
            'stage' => $this->stage ?? $stage,
            'payment_status' => $this->payment_status ?? $status,
            'method' => $methodName,
            'ref' => $this->ref ?? "TXN-GRN-{$this->id}",
            'note' => $this->note ?? "Supplier stock consignment settlement - {$grnNum}",
            'date' => $this->pay_date instanceof \DateTimeInterface ? $this->pay_date->format('Y-m-d') : ($this->pay_date ? substr((string) $this->pay_date, 0, 10) : now()->toDateString()),
            'payment_types_id' => $this->payment_types_id,
            'payment_statuses_id' => $this->payment_statuses_id,
            'pay_date' => $this->pay_date?->toIso8601String() ?? $this->pay_date,
            'type' => new PaymentTypeResource($this->whenLoaded('paymentType')),
            'status' => new PaymentStatusResource($this->whenLoaded('paymentStatus')),
            'grn' => new GrnResource($this->whenLoaded('grn')),
        ];
    }
}
