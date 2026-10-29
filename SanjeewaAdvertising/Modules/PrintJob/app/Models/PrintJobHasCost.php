<?php

namespace Modules\PrintJob\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Design\Models\PrintCost;

class PrintJobHasCost extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'print_job_has_cost';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'print_job_cost_print_jobs_id';

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
        'print_job_cost_print_jobs_id',
        'print_cost_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'print_job_cost_print_jobs_id' => 'integer',
            'print_cost_id' => 'integer',
        ];
    }

    /**
     * Get the print job cost record.
     */
    public function printJobCost(): BelongsTo
    {
        return $this->belongsTo(PrintJobCost::class, 'print_job_cost_print_jobs_id', 'print_jobs_id');
    }

    /**
     * Get the print cost item.
     */
    public function printCost(): BelongsTo
    {
        return $this->belongsTo(PrintCost::class, 'print_cost_id', 'id');
    }
}
