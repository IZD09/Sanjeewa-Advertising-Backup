<?php

namespace Modules\Supplier\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'purchase_orders';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'add_date',
        'suppliers_id',
        'purchase_orders_status_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'add_date' => 'datetime',
            'suppliers_id' => 'integer',
            'purchase_orders_status_id' => 'integer',
        ];
    }

    /**
     * Get the status of the purchase order.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderStatus::class, 'purchase_orders_status_id', 'id');
    }

    /**
     * Alias for purchase orders status.
     */
    public function purchaseOrdersStatus(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderStatus::class, 'purchase_orders_status_id', 'id');
    }

    /**
     * Get the supplier that owns the purchase order.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'suppliers_id', 'id');
    }

    /**
     * Get the line items for the purchase order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_orders_id', 'id');
    }

    /**
     * Get the goods received notes (GRNs) for this purchase order.
     */
    public function grns(): BelongsToMany
    {
        return $this->belongsToMany(
            Grn::class,
            'grn_has_puches_order',
            'purchase_orders_id',
            'grn_id'
        )->withPivot('supplyer_invoice');
    }
}
