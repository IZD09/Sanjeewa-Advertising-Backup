<?php

namespace Modules\Inventory\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use Modules\Supplier\Models\Grn;
use Modules\Supplier\Models\GrnStatus;

class StoreStockRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->has('items') && is_array($this->input('items'))) {
            return [
                'grn_id' => ['required', 'integer', 'exists:grn,id'],
                'add_date' => ['required', 'date'],
                'items' => ['required', 'array', 'min:1'],
                'items.*.stock_items_id' => ['required', 'integer', 'exists:stock_items,id'],
                'items.*.brands_id' => ['required', 'integer', 'exists:brands,id'],
                'items.*.qty' => ['required', 'numeric', 'min:0.001'],
                'items.*.buy' => ['required', 'numeric', 'min:0'],
                'items.*.price' => ['required', 'numeric', 'min:0'],
                'items.*.batch_id' => ['nullable', 'integer', 'exists:item_batches,id'],
                'items.*.create_new_batch' => ['nullable', 'boolean'],
            ];
        }

        return [
            'stock_items_id' => ['required', 'integer', 'exists:stock_items,id'],
            'brands_id' => ['required', 'integer', 'exists:brands,id'],
            'qty' => ['required', 'numeric', 'min:0.001'],
            'buy' => ['required', 'numeric', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'grn_id' => ['required', 'integer', 'exists:grn,id'],
            'batch_id' => ['nullable', 'integer', 'exists:item_batches,id'],
            'create_new_batch' => ['nullable', 'boolean'],
            'add_date' => ['nullable', 'date'],
        ];
    }

    /**
     * Configure the validator instance to verify GRN Pending Stock status.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $grnId = (int) $this->input('grn_id');
            if ($grnId <= 0 || $validator->errors()->has('grn_id')) {
                return;
            }

            $grn = Grn::with('grnStatus')->find($grnId);
            if (! $grn) {
                $validator->errors()->add('grn_id', 'Selected GRN record could not be found.');

                return;
            }

            if ((int) $grn->grn_statuses_id !== GrnStatus::STATUS_PENDING_STOCK) {
                $statusLabel = $grn->grnStatus?->grn_status ?? 'Unknown';
                $grnCode = 'GRN-'.str_pad((string) $grn->id, 4, '0', STR_PAD_LEFT);
                $validator->errors()->add(
                    'grn_id',
                    "Selected GRN ({$grnCode}) is in '{$statusLabel}' status. Only GRNs in 'Pending Stock' status can be added to stock."
                );

                return;
            }

            // Verify received qty does not exceed GRN item qty
            $items = $this->input('items');
            if (is_array($items) && count($items) > 0) {
                $grn->loadMissing(['purchaseOrders.items', 'stocks']);
                $expectedQtyMap = [];

                foreach ($grn->purchaseOrders as $po) {
                    foreach ($po->items as $poi) {
                        $itemId = (int) $poi->stock_items_id;
                        $poQty = round((float) ($poi->qty_received > 0 ? $poi->qty_received : $poi->qty_ordered), 3);
                        if ($poQty > 0) {
                            $expectedQtyMap[$itemId] = round(($expectedQtyMap[$itemId] ?? 0) + $poQty, 3);
                        }
                    }
                }

                foreach ($grn->stocks as $grnStock) {
                    $itemId = (int) $grnStock->stock_items_id;
                    if ((float) $grnStock->qty > 0) {
                        $expectedQtyMap[$itemId] = round((float) $grnStock->qty, 3);
                    }
                }

                foreach ($items as $idx => $itemRow) {
                    $itemId = (int) ($itemRow['stock_items_id'] ?? 0);
                    $receivedQty = round((float) ($itemRow['qty'] ?? 0), 3);
                    $maxQty = $expectedQtyMap[$itemId] ?? null;

                    if ($maxQty !== null && $maxQty > 0 && $receivedQty > $maxQty + 0.0001) {
                        $validator->errors()->add(
                            "items.{$idx}.qty",
                            "Received quantity ({$receivedQty}) for item #".($idx + 1)." cannot exceed GRN quantity ({$maxQty})."
                        );
                    }
                }
            }
        });
    }

    /**
     * Custom attribute names for validation errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'stock_items_id' => 'material item',
            'brands_id' => 'brand',
            'qty' => 'quantity',
            'buy' => 'purchase cost',
            'price' => 'selling price',
            'grn_id' => 'GRN reference',
            'batch_id' => 'batch number',
            'items' => 'stock items list',
            'items.*.stock_items_id' => 'material item',
            'items.*.brands_id' => 'brand',
            'items.*.qty' => 'quantity',
            'items.*.buy' => 'purchase cost',
            'items.*.price' => 'selling price',
        ];
    }
}
