<?php

namespace Modules\PrintJob\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Design\Models\PrintCost;

class PrintJobCost extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'print_job_cost';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'print_jobs_id';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The data type of the primary key.
     *
     * @var string
     */
    protected $keyType = 'int';

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
        'print_jobs_id',
        'discount',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'print_jobs_id' => 'integer',
            'discount' => 'decimal:2',
        ];
    }

    /**
     * Get the print job that owns this cost record.
     */
    public function printJob(): BelongsTo
    {
        return $this->belongsTo(PrintJob::class, 'print_jobs_id', 'id');
    }

    /**
     * Get the print cost items included in this cost record.
     */
    public function printCosts(): BelongsToMany
    {
        return $this->belongsToMany(
            PrintCost::class,
            'print_job_has_cost',
            'print_job_cost_print_jobs_id',
            'print_cost_id',
            'print_jobs_id',
            'id'
        );
    }

    /**
     * Get the intermediate pivot records for print costs.
     */
    public function hasCosts(): HasMany
    {
        return $this->hasMany(PrintJobHasCost::class, 'print_job_cost_print_jobs_id', 'print_jobs_id');
    }
}
