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
            $stockTotal = (float) $grn->stocks->sum(fn ($s) => (float) ($s->qty * $s->buy));
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
        if ($grn && $grn->relationLoaded('purchaseOrders')) {
            foreach ($grn->purchaseOrders as $po) {
                $poList[] = 'PO-2026-'.str_pad((string) $po->id, 3, '0', STR_PAD_LEFT);
            }
        }
        $poNum = count($poList) > 0 ? implode(', ', $poList) : ('PO-2026-'.str_pad((string) ($this->grn_id ?? '101'), 3, '0', STR_PAD_LEFT));

        $supplierName = 'PaperPro Lanka (Pvt) Ltd';
        if ($grn && $grn->relationLoaded('purchaseOrders') && $grn->purchaseOrders->first()?->supplier?->name) {
            $supplierName = $grn->purchaseOrders->first()->supplier->name;
        }

        $stockCategory = 'Stock Delivery & Consignment';
        if ($grn && $grn->relationLoaded('stocks') && $grn->stocks->first()?->item?->name) {
            $stockCategory = $grn->stocks->first()->item->name.' (+'.count($grn->stocks).' materials)';
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
            'supplier_id' => 'SUP-001',
            'supplier_name' => $supplierName,
            'supplierName' => $supplierName,
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
