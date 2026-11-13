<?php

namespace Modules\Supplier\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $items = $this->input('items');
        if (is_array($items)) {
            $normalizedItems = [];
            foreach ($items as $item) {
                if (! is_array($item)) {
                    continue;
                }
                $stockItemsId = $item['stock_items_id'] ?? $item['id'] ?? null;
                $qtyOrdered = $item['qty_ordered'] ?? $item['qty'] ?? 1;
                $unitCost = $item['unit_cost'] ?? $item['cost'] ?? 0;
                $qtyReceived = $item['qty_received'] ?? 0;

                $normalizedItems[] = [
                    'stock_items_id' => $stockItemsId ? (int) $stockItemsId : null,
                    'qty_ordered' => (int) $qtyOrdered,
                    'unit_cost' => (float) $unitCost,
                    'qty_received' => (int) $qtyReceived,
                ];
            }
            $this->merge(['items' => $normalizedItems]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'suppliers_id' => ['required_without:supplier_name', 'nullable', 'integer', 'exists:suppliers,id'],
            'supplier_name' => ['required_without:suppliers_id', 'nullable', 'string', 'max:100'],
            'supplier_contact' => ['nullable', 'string', 'max:50'],
            'purchase_orders_status_id' => ['nullable', 'integer', 'exists:purchase_orders_status,id'],
            'add_date' => ['nullable', 'date'],
            'expected_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string', 'max:500'],
            'items' => ['nullable', 'array'],
            'items.*.stock_items_id' => ['required_with:items', 'integer', 'exists:stock_items,id'],
            'items.*.unit_cost' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.qty_ordered' => ['required_with:items', 'integer', 'min:1'],
            'items.*.qty_received' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
