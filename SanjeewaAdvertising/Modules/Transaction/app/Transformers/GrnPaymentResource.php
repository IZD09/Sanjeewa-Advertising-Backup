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
<<<<<<< HEAD
        return [
            'id' => $this->id,
            'payment' => (float) $this->payment,
            'amount' => (float) $this->payment,
            'grn_id' => $this->grn_id,
=======
        $netTotal = (float) ($this->net_total ?? $this->totalBill ?? $this->total_amount ?? $this->payment ?? 0);
        $paid = (float) ($this->paid_amount ?? $this->paidAmount ?? $this->payment ?? 0);
        $bal = (float) ($this->balance ?? $this->balance_amount ?? $this->balanceAmount ?? max(0, $netTotal - $paid));

        return [
            'id' => $this->id,
            'payment' => (float) $this->payment,
            'amount' => $paid,
            'paid_amount' => $paid,
            'paidAmount' => $paid,
            'grn_id' => $this->grn_id,
            'grn_number' => $this->grn_number ?? ($this->grn?->id ? 'GRN-2610-'.str_pad((string) $this->grn->id, 3, '0', STR_PAD_LEFT) : 'GRN-2610-001'),
            'po_number' => $this->po_number ?? 'PO-2026-088',
            'supplier_id' => $this->supplier_id ?? 'SUP-001',
            'supplier_name' => $this->supplier_name ?? $this->grn?->supplier?->name ?? 'PaperPro Lanka',
            'stock_category' => $this->stock_category ?? '300gsm Art Board & Cyan Ink',
            'net_total' => $netTotal,
            'totalBill' => $netTotal,
            'balance' => $bal,
            'balance_amount' => $bal,
            'balanceAmount' => $bal,
            'stage' => $this->stage ?? ($bal <= 0 ? 'Complete Payment' : ($paid > 0 ? 'Advance Payment' : 'Pending Payment')),
            'payment_status' => $this->payment_status ?? ($bal <= 0 ? 'Paid' : ($paid > 0 ? 'Partial' : 'Pending')),
            'method' => $this->method ?? 'Check',
            'ref' => $this->ref ?? 'CHQ-882019-COMBANK',
            'note' => $this->note ?? '',
            'date' => $this->date ?? ($this->pay_date instanceof \DateTimeInterface ? $this->pay_date->format('Y-m-d') : ($this->pay_date ?? now()->toDateString())),
>>>>>>> origin/Ardithya
            'payment_types_id' => $this->payment_types_id,
            'payment_statuses_id' => $this->payment_statuses_id,
            'pay_date' => $this->pay_date?->toIso8601String() ?? $this->pay_date,
            'type' => new PaymentTypeResource($this->whenLoaded('paymentType')),
            'status' => new PaymentStatusResource($this->whenLoaded('paymentStatus')),
            'grn' => new GrnResource($this->whenLoaded('grn')),
        ];
    }
}
