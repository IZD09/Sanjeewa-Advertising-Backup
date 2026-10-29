<?php

namespace Modules\Design\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Modules\PrintJob\Models\PrintJobCost;

class PrintCost extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'print_cost';

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
        'print_cost_type_id',
        'price',
        'add_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'print_cost_type_id' => 'integer',
            'price' => 'decimal:2',
            'add_at' => 'datetime',
        ];
    }

    /**
     * Get the print cost type that owns the print cost.
     */
    public function printCostType(): BelongsTo
    {
        return $this->belongsTo(PrintCostType::class, 'print_cost_type_id', 'id');
    }

    /**
     * Get the print job costs associated with this print cost.
     */
    public function printJobCosts(): BelongsToMany
    {
        return $this->belongsToMany(
            PrintJobCost::class,
            'print_job_has_cost',
            'print_cost_id',
            'print_job_cost_print_jobs_id',
            'id',
            'print_jobs_id'
        );
    }
}
