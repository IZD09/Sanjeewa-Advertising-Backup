<?php

namespace Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'brands';

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
        'brand',
    ];

    /**
     * Get the stock items associated with this brand.
     */
    public function stockItems(): BelongsToMany
    {
        return $this->belongsToMany(
            StockItem::class,
            'stock_items_has_brands',
            'brands_id',
            'stock_items_id'
        );
    }

    /**
     * Get the stock records for this brand.
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class, 'brands_id', 'id');
    }
}
