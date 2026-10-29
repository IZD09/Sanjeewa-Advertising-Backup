<?php

namespace Modules\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'stock_movements';

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
        'stock_id',
        'stock_movements_types_id',
        'qty',
        'date',
        'source_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stock_id' => 'integer',
            'stock_movements_types_id' => 'integer',
            'qty' => 'integer',
            'date' => 'datetime',
            'source_id' => 'integer',
        ];
    }

    /**
     * Get the stock item record associated with this movement.
     */
    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class, 'stock_id', 'id');
    }

    /**
     * Get the type of stock movement.
     */
    public function movementType(): BelongsTo
    {
        return $this->belongsTo(StockMovementType::class, 'stock_movements_types_id', 'id');
    }
}
