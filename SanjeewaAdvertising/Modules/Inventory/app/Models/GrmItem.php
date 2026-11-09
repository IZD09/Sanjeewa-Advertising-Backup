<?php

namespace Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Supplier\Models\Grn;

class GrmItem extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'grm_items';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

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
        'grn_id',
        'item_batches_id',
        'stock_id',
        'qty',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'grn_id' => 'integer',
            'item_batches_id' => 'integer',
            'stock_id' => 'integer',
            'qty' => 'integer',
        ];
    }

    /**
     * Get the GRN associated with this item.
     */
    public function grn(): BelongsTo
    {
        return $this->belongsTo(Grn::class, 'grn_id', 'id');
    }

    /**
     * Get the item batch associated with this item.
     */
    public function itemBatch(): BelongsTo
    {
        return $this->belongsTo(ItemBatch::class, 'item_batches_id', 'id');
    }

    /**
     * Alias for itemBatch relationship.
     */
    public function batch(): BelongsTo
    {
        return $this->itemBatch();
    }

    /**
     * Get the stock record associated with this item.
     */
    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class, 'stock_id', 'id');
    }
}
