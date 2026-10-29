<?php

namespace Modules\Design\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PrintCostType extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'print_cost_type';

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
        'print_types_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'print_types_id' => 'integer',
        ];
    }

    /**
     * Get the print type that owns the cost type.
     */
    public function printType(): BelongsTo
    {
        return $this->belongsTo(PrintType::class, 'print_types_id', 'id');
    }

    /**
     * Get the print costs for this cost type.
     */
    public function printCosts(): HasMany
    {
        return $this->hasMany(PrintCost::class, 'print_cost_type_id', 'id');
    }
}
