<?php

namespace Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\PrintJob\Models\PrintJob;
use Modules\Supplier\Models\Grn;

class Stock extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'stock';

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
        'add_date',
        'qty',
        'price',
        'buy',
        'grn_id',
        'brands_id',
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
            'add_date' => 'datetime',
            'qty' => 'integer',
            'price' => 'decimal:2',
            'buy' => 'decimal:2',
            'grn_id' => 'integer',
            'brands_id' => 'integer',
        ];
    }

    /**
     * Get the stock item associated with this stock entry.
     */
    public function stockItem(): BelongsTo
    {
        return $this->belongsTo(StockItem::class, 'stock_items_id', 'id');
    }

    /**
     * Get the GRN associated with this stock entry.
     */
    public function grn(): BelongsTo
    {
        return $this->belongsTo(Grn::class, 'grn_id', 'id');
    }

    /**
     * Get the brand associated with this stock entry.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brands_id', 'id');
    }

    /**
     * Get the movements recorded for this stock entry.
     */
    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'stock_id', 'id');
    }

    /**
     * Get the print jobs that consume this stock.
     */
    public function printJobs(): BelongsToMany
    {
        return $this->belongsToMany(
            PrintJob::class,
            'print_jobs_stock_items',
            'stock_id',
            'print_jobs_id'
        )->withPivot('qty');
    }

    /**
     * Get the GRN items associated with this stock entry.
     */
    public function grmItems(): HasMany
    {
        return $this->hasMany(GrmItem::class, 'stock_id', 'id');
    }

    /**
     * Alias for GRN items.
     */
    public function grnItems(): HasMany
    {
        return $this->grmItems();
    }
}
