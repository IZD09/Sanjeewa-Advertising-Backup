<?php

namespace Modules\Supplier\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Inventory\Models\Stock;
use Modules\Transaction\Models\GrnPayment;

class Grn extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'grn';

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
        'at_time',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'at_time' => 'datetime',
        ];
    }

    /**
     * Get the stock entries resulting from this GRN.
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class, 'grn_id', 'id');
    }

    /**
     * Get the purchase orders associated with this GRN.
     */
    public function purchaseOrders(): BelongsToMany
    {
        return $this->belongsToMany(
            PurchaseOrder::class,
            'grn_has_puches_order',
            'grn_id',
            'purchase_orders_id'
        )->withPivot('supplyer_invoice');
    }

    /**
     * Get the payments made for this GRN.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(GrnPayment::class, 'grn_id', 'id');
    }
}
