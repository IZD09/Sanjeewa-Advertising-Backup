<?php

namespace Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Supplier\Models\PurchaseOrderItem;

class StockItem extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'stock_items';

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
        'name',
        'subcategories_id',
        'code',
        'low_stock_qty',
        'reorder_qty',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subcategories_id' => 'integer',
            'low_stock_qty' => 'integer',
            'reorder_qty' => 'integer',
        ];
    }

    /**
     * Get the subcategory that owns the stock item.
     */
    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class, 'subcategories_id', 'id');
    }

    /**
     * Get the brands associated with this stock item.
     */
    public function brands(): BelongsToMany
    {
        return $this->belongsToMany(
            Brand::class,
            'stock_items_has_brands',
            'stock_items_id',
            'brands_id'
        );
    }

    /**
     * Get the stock records for this stock item.
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class, 'stock_items_id', 'id');
    }

    /**
     * Get the purchase order items for this stock item.
     */
    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class, 'stock_items_id', 'id');
    }

    /**
     * Get the batches for this stock item.
     */
    public function batches(): HasMany
    {
        return $this->hasMany(ItemBatch::class, 'stock_items_id', 'id');
    }
}
