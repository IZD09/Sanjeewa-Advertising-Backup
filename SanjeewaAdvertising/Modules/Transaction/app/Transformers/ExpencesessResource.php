<?php

namespace Modules\Transaction\Transformers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Transaction\Models\Expencesess;

/**
 * @mixin Expencesess
 */
class ExpencesessResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $typeName = $this->type?->expencesess_type ?? 'Other Operating Expenses';
        $statusName = $this->status?->expencesess_status ?? ($this->pay_by ? 'Paid' : 'Pending');

        // Categorization for Operating Expense cards and filters
        $category = 'Maintenance & Other';
        $provider = 'Operating Overhead';
        if (str_contains($typeName, 'Electric')) {
            $category = 'Electricity';
            $provider = 'CEB / LECO';
        } elseif (str_contains($typeName, 'Water')) {
            $category = 'Water Board';
            $provider = 'NWSDB';
        } elseif (str_contains($typeName, 'Internet') || str_contains($typeName, 'Telephone')) {
            $category = 'Internet & Fiber';
            $provider = 'SLT Fiber / Dialog';
        } elseif (str_contains($typeName, 'Rent') || str_contains($typeName, 'Lease')) {
            $category = 'Shop Rent';
            $provider = 'Shop Landlord';
        } elseif (str_contains($typeName, 'Maintenance') || str_contains($typeName, 'Parts')) {
            $category = 'Maintenance & Other';
            $provider = 'Machine Service & Spares';
        }

        $addDate = $this->add_date instanceof \DateTimeInterface
            ? $this->add_date
            : ($this->add_date ? Carbon::parse($this->add_date) : now());

        $month = $addDate->format('Y-m');
        $dueDate = $addDate->copy()->endOfMonth()->toDateString();
        $isPaid = (strtolower($statusName) === 'paid' || $this->pay_by !== null);

        $payDateStr = $this->pay_at instanceof \DateTimeInterface
            ? $this->pay_at->toDateString()
            : ($this->pay_at ? substr((string) $this->pay_at, 0, 10) : '');

        return [
            'id' => 'EXP-2026-'.str_pad((string) $this->id, 3, '0', STR_PAD_LEFT),
            'raw_id' => $this->id,
            'title' => $typeName,
            'category' => $category,
            'provider' => $provider,
            'account_no' => 'ACC-'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT),
            'accountNo' => 'ACC-'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT),
            'month' => $month,
            'due_date' => $dueDate,
            'dueDate' => $dueDate,
            'price' => (float) $this->price,
            'amount' => (float) $this->price,
            'status' => $isPaid ? 'Paid' : 'Pending',
            'paid_amount' => $isPaid ? (float) $this->price : 0.0,
            'paidAmount' => $isPaid ? (float) $this->price : 0.0,
            'paid_date' => $payDateStr,
            'paidDate' => $payDateStr,
            'paid_method' => $isPaid ? 'Bank Transfer' : '',
            'paidMethod' => $isPaid ? 'Bank Transfer' : '',
            'paid_ref' => $isPaid ? "EXP-TXN-{$this->id}" : '',
            'paidRef' => $isPaid ? "EXP-TXN-{$this->id}" : '',
            'paid_note' => $isPaid ? 'Settled through business account' : '',
            'notes' => "Operating monthly overhead - {$typeName}",
            'expencesess_types_id' => $this->expencesess_types_id,
            'expencesess_statuses_id' => $this->expencesess_statuses_id,
            'add_by' => $this->add_by,
            'pay_by' => $this->pay_by,
            'add_date' => $this->add_date?->toIso8601String() ?? $this->add_date,
            'pay_at' => $this->pay_at?->toIso8601String() ?? $this->pay_at,
            'type' => new ExpencesessTypeResource($this->whenLoaded('type')),
            'status' => new ExpencesessStatusResource($this->whenLoaded('status')),
            'added_by' => $this->whenLoaded('addedBy', function () {
                return [
                    'id' => $this->addedBy->id,
                    'name' => trim("{$this->addedBy->first_name} {$this->addedBy->last_name}"),
                    'username' => $this->addedBy->username,
                ];
            }),
            'paid_by' => $this->whenLoaded('paidBy', function () {
                return $this->paidBy ? [
                    'id' => $this->paidBy->id,
                    'name' => trim("{$this->paidBy->first_name} {$this->paidBy->last_name}"),
                    'username' => $this->paidBy->username,
                ] : null;
            }),
        ];
    }
}
