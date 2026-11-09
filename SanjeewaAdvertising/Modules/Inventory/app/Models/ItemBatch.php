<?php

namespace Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Supplier\Models\Grn;

class ItemBatch extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'item_batches';

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
        'stock_items_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stock_items_id' => 'integer',
        ];
    }

    /**
     * Get the stock item this batch belongs to.
     */
    public function stockItem(): BelongsTo
    {
        return $this->belongsTo(StockItem::class, 'stock_items_id', 'id');
    }

    /**
     * Get the GRN items associated with this batch.
     */
    public function grmItems(): HasMany
    {
        return $this->hasMany(GrmItem::class, 'item_batches_id', 'id');
    }

    /**
     * Alias for GRN items.
     */
    public function grnItems(): HasMany
    {
        return $this->grmItems();
    }

    /**
     * Get the GRNs associated with this batch through grm_items.
     */
    public function grns(): BelongsToMany
    {
        return $this->belongsToMany(
            Grn::class,
            'grm_items',
            'item_batches_id',
            'grn_id'
        )->withPivot(['stock_id', 'qty']);
    }

    /**
     * Get the stocks associated with this batch through grm_items.
     */
    public function stocks(): BelongsToMany
    {
        return $this->belongsToMany(
            Stock::class,
            'grm_items',
            'item_batches_id',
            'stock_id'
        )->withPivot(['grn_id', 'qty']);
    }
}
